from flask import Flask, request, jsonify ,send_file
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
import os
import secrets
from flask_cors import CORS
from sqlalchemy import LargeBinary
import base64
import io

app = Flask(__name__)
CORS(app,origins=["http://localhost:3000"])

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'new_database.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    useremail = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    client_ip = db.Column(db.String(15))
    folder_key = db.Column(db.String(100))

    def __init__(self, username, useremail, password, client_ip=None, folder_key=None):
        self.username = username
        self.useremail = useremail
        self.password = password
        self.client_ip = client_ip
        self.folder_key = folder_key if folder_key is not None else secrets.token_hex(16)

class Folder(db.Model):
    folder_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    folders = db.Column(db.String(255), nullable=False, unique=True)

    def __init__(self, user_id, folders):
        self.user_id = user_id
        self.folders = folders

class Image(db.Model):
    image_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    images = db.Column(db.String(255), nullable=False,unique=True)
    name = db.Column(db.String(255))  # Increase the size to accommodate longer filenames
    data = db.Column(LargeBinary)

    def __init__(self, user_id, images, name ,data):
        self.user_id = user_id
        self.images = images
        self.name = name
        self.data = data
        
with app.app_context():
    db.create_all()

class UserSchema(ma.Schema):
    class Meta:
        fields = ('user_id', 'username', 'useremail', 'password', 'client_ip', 'folder_key')

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class FolderSchema(ma.Schema):
    class Meta:
        fields = ('folder_id', 'user_id', 'folders')

folder_schema = FolderSchema()
folders_schema = FolderSchema(many=True)

class ImageSchema(ma.Schema):
    class Meta:
        fields = ('image_id', 'user_id', 'images', 'name', 'dataimage')

image_schema = ImageSchema()
images_schema = ImageSchema(many=True)

def folder_create(directory_path):
    try:
        os.makedirs(directory_path)
    except FileNotFoundError:
        os.makedirs(os.path.dirname(directory_path))
        os.makedirs(directory_path)
    except FileExistsError:
        return f"The directory '{directory_path}' already exists."
    except Exception as e:
        return f"An error occurred: {e}"

@app.route('/user', methods=['POST'])
def add_user():
    try:
        username = request.json['username']
        useremail = request.json['useremail']
        password = request.json['password']
        client_ip = request.environ['REMOTE_ADDR']

        # Check if a user with the same email already exists
        existing_user = User.query.filter_by(useremail=useremail).first()
        if existing_user:
            return {"error": "User with the same email already exists"}

        new_user = User(username=username, useremail=useremail, password=password, client_ip=client_ip)
        db.session.add(new_user)
        db.session.commit()

        res = user_schema.dump(new_user)
        main_folder = res['folder_key']
        folder_create(main_folder)

        return user_schema.jsonify(new_user)
    except IntegrityError as e:
        db.session.rollback()  # Rollback the transaction to prevent partially added data
        return {"error": "Error adding user to the database"}

@app.route('/login', methods=['POST'])
def login_user():
    try:
        useremail = request.json['useremail']
        password = request.json['password']

        print(f"Received useremail: {useremail}, password: {password}")

        user = User.query.filter_by(useremail=useremail, password=password).first()

        if user:
            response_data = {
                "user_id": user.user_id,
                "username": user.username,
                "useremail": user.useremail,
                "client_ip": user.client_ip,
                "folder_key": user.folder_key,
            }
            return jsonify(response_data)
        else:
            return jsonify({"error": "Invalid credentials"}), 401  # Unauthorized status code
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500  # Internal Server Error status code

@app.route('/users', methods=['GET'])
def get_users():
    all_users = User.query.all()
    result = users_schema.dump(all_users)
    return jsonify(result)

@app.route('/folder', methods=['POST'])
def add_folder():
    try:
        user_id = request.json['user_id']
        folders = request.json['folders']

        # Retrieve the user's folder_key
        # user = User.query.get(user_id)
        # folder_key = user.folder_key
        new_folder = Folder(user_id=user_id, folders=folders)

        db.session.add(new_folder)
        db.session.commit()

        folder_res = folder_schema.dump(new_folder)
        sub_folder = folder_res['folders']
        folder_res_result = folder_create(sub_folder)
        return {'data': folder_res, "folder_res": folder_res_result}

    except IntegrityError as e:
        return {"error": f"{e.statement} - unique name needs to be given"}


@app.route('/folders', methods=['GET'])
def get_folders():
    user_id = request.args.get('user_id')
    if user_id:
        user_folders = Folder.query.filter_by(user_id=user_id).all()
        result = folders_schema.dump(user_folders)
    else:
        all_folders = Folder.query.all()
        result = folders_schema.dump(all_folders)
    return jsonify(result)


@app.route('/upload', methods=['POST'])
def upload():
    if 'images' in request.files:
        print(request)
        image = request.files['images'] 
        user_id=request.form.get('user_id')
        folder_path=request.form.get('folder_key')
        if image.filename != '':
            image_data = image.read()
            filename = secure_filename(image.filename)
            filepath = os.path.join(folder_path, filename)
            filepath = filepath.replace("\\", "/") # new
            image.save(filepath)
            new_image = Image(user_id=user_id,images=filepath,name=filename,data=image_data)
            db.session.add(new_image)
            db.session.commit()

            return jsonify({'message': 'Image uploaded successfully'})
    return jsonify({'error': 'No image provided'})


@app.route('/images', methods=['GET'])
def get_images():
    all_images = Image.query.all()
    result = images_schema.dump(all_images)
    return jsonify(result)


@app.route('/allfolders/<user_id>/<names>', methods=['GET'])
def get_user_folders_new(user_id,names):
    try:
        user = db.session.get(User, user_id)
        if not user:
            abort(404, description=f"User with ID {user_id} not found")
        folders_query = db.session.query(Folder).filter_by(user_id=user_id)
        folders = folders_query.all()
        folder_paths = [folder.folders for folder in folders]
        subfolders = set()
        for path in folder_paths:
            parts = ",".join(path.split("/"))
            name = ",".join(names.split("||"))+','
            if name in parts:
                datasss=",".join(parts.split(name)).split(',')
                subfolders.add("/".join(datasss))

        return jsonify({'user_id': user_id, 'subfolders': list(subfolders)})

    except Exception as e:
        return jsonify({'error': f"An error occurred: {e}"}), 500
    
@app.route('/downloadImg/<string:image_name>', methods=['GET'])
def get_image(image_name):
    try:
        image = db.session.query(Image).filter_by(name=image_name).first()
        if image:
            return send_file(io.BytesIO(image.data),
                             mimetype='image/jpeg',  # Change the mimetype based on your image type
                             as_attachment=True,
                             download_name=f'{image_name}.jpg')  # Change the download file name if needed
        else:
            return jsonify({"message": "Image not found"})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/getimge/<string:image_name>', methods=['GET'])
def get_image_base(image_name):
    try:
        image = db.session.query(Image).filter_by(name=image_name).first()
        if image:
            # Convert image data to base64
            image_data_base64 = base64.b64encode(image.data).decode('utf-8')

            # Build the response JSON
            response_data = {
                "image_name": image_name,
                "image_data": image_data_base64,
                "mimetype": 'image/png'  # Change the mimetype based on your image type
            }

            return jsonify(response_data)
        else:
            return jsonify({"message": "Image not found"})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/allimages/<user_id>/<names>', methods=['GET'])
def get_user_images_new(user_id,names):
    try:
        user = db.session.get(User, user_id)
        if not user:
            abort(404, description=f"User with ID {user_id} not found")
        images_query = db.session.query(Image).filter_by(user_id=user_id)
        images = images_query.all()
        image_paths = [image.images for image in images]
        subfolders = set()
        for path in image_paths:
            parts = ",".join(path.split("/"))
            name = ",".join(names.split("||"))+','
            if name in parts:
                # print(name)
                datasss=",".join(parts.split(name)).split(',')[1]
                if "." in datasss:
                    print(datasss)
                    subfolders.add(datasss)

        return jsonify({'user_id': user_id, 'subfolders': list(subfolders)})

    except Exception as e:
        return jsonify({'error': f"An error occurred: {e}"}), 500
    

@app.route('/getimgeApis/<string:image_list>', methods=['GET'])
def get_image_base_apii(image_list):
    try:
        allimg = image_list.split(',')
        allimage=[]
        for i in allimg:
            image = db.session.query(Image).filter_by(name=i).first()
            if image:
                image_data_base64 = base64.b64encode(image.data).decode('utf-8')
                allimage.append({
                    "image_name": i,
                    "image_data": image_data_base64,
                    "mimetype": f'{i}/png'  # Change the mimetype based on your image type
                })
        return jsonify(allimage)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True,port=5003)