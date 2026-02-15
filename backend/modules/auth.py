"""
Google OAuth Authentication Module
Handles Google Sign-in/Sign-up flow with database integration
"""
import os
import bcrypt
from flask import Blueprint, request, jsonify, redirect, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from prisma import Prisma

load_dotenv()

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Initialize OAuth
oauth = OAuth()

# Initialize global Prisma client (optional, but good practice to have one available)
db_global = Prisma()

def init_oauth(app):
    """Initialize OAuth with app"""
    oauth.init_app(app)
    
    # Configure Google OAuth
    google = oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
    return google

@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    """Email/Password Signup"""
    db = None
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', email.split('@')[0])  # Use email prefix as default name
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        # Connect to database
        db = Prisma()
        db.connect()
        
        # Check if user already exists
        try:
            existing_user = db.user.find_unique(where={'email': email})
            if existing_user:
                db.disconnect()
                return jsonify({'success': False, 'error': 'Email already registered'}), 400
        except Exception as query_error:
            print(f"✗ Database query error: {str(query_error)}")
            if db:
                db.disconnect()
            return jsonify({'success': False, 'error': 'Database error. Please try again.'}), 500
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create new user
        try:
            user = db.user.create(
                data={
                    'email': email,
                    'name': name,
                    'password': hashed_password.decode('utf-8'),
                }
            )
        except Exception as create_error:
            print(f"✗ User creation error: {str(create_error)}")
            if db:
                db.disconnect()
            return jsonify({'success': False, 'error': 'Could not create user. Please try again.'}), 500
        
        db.disconnect()
        
        # Store user session
        session['user'] = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'profilePicture': user.profilePicture
        }
        
        print(f"✓ New user signed up: {email}")
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'profilePicture': user.profilePicture
            }
        })
        
    except Exception as e:
        print(f"✗ Signup error: {str(e)}")
        if db:
            try:
                db.disconnect()
            except:
                pass
        return jsonify({'success': False, 'error': 'An unexpected error occurred. Please try again.'}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Email/Password Login"""
    db = None
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        # Connect to database
        db = Prisma()
        db.connect()
        
        # Find user
        user = db.user.find_unique(where={'email': email})
        
        if not user or not user.password:
            db.disconnect()
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            db.disconnect()
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        db.disconnect()
        
        # Store user session
        session['user'] = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'profilePicture': user.profilePicture
        }
        
        print(f"✓ User logged in: {email}")
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'profilePicture': user.profilePicture
            }
        })
        
    except Exception as e:
        print(f"✗ Login error: {str(e)}")
        if db:
            try:
                db.disconnect()
            except:
                pass
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/google/login')
def google_login():
    """Redirect to Google OAuth"""
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/auth/google/callback')
def google_callback():
    """Handle Google OAuth callback and save user to database"""
    db = None
    try:
        # Get token from Google
        token = oauth.google.authorize_access_token()
        
        # Get user info
        user_info = token.get('userinfo')
        
        if not user_info:
            return jsonify({'success': False, 'error': 'Failed to get user info'}), 400
        
        # Extract user data
        email = user_info.get('email')
        name = user_info.get('name')
        google_id = user_info.get('sub')
        profile_picture = user_info.get('picture')
        
        # Connect to database
        db = Prisma()
        db.connect()
        
        # Check if user exists
        existing_user = db.user.find_unique(
            where={'googleId': google_id}
        )
        
        if existing_user:
            # Update existing user
            user = db.user.update(
                where={'id': existing_user.id},
                data={
                    'name': name,
                    'profilePicture': profile_picture,
                }
            )
            print(f"✓ Existing user logged in: {email}")
        else:
            # Create new user
            user = db.user.create(
                data={
                    'email': email,
                    'name': name,
                    'googleId': google_id,
                    'profilePicture': profile_picture,
                }
            )
            print(f"✓ New user created: {email}")
        
        # Disconnect from database
        db.disconnect()
        
        # Store user session
        session['user'] = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'profilePicture': user.profilePicture
        }
        
        # Redirect to frontend scan input page with success
        return redirect('http://localhost:5173?auth=success#input')
        
    except Exception as e:
        print(f"✗ Google OAuth error: {str(e)}")
        if db:
            try:
                db.disconnect()
            except:
                pass
        return redirect('http://localhost:5173?error=oauth_failed#signup')

@auth_bp.route('/auth/user')
def get_current_user():
    """Get currently authenticated user"""
    user = session.get('user')
    if user:
        return jsonify({'success': True, 'user': user})
    return jsonify({'success': False, 'error': 'Not authenticated'}), 401

@auth_bp.route('/auth/logout')
def logout():
    """Logout user"""
    session.pop('user', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})
