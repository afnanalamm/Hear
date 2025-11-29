@app.route("/create_post", methods=["POST"])
def create_post():
    data = request.json
    required_fields = ["userID", "description", "postType", "deadline", "location"]
    
    # Check for required fields
    if not all(data.get(field) for field in required_fields):
        return jsonify({"message": "Missing required fields: Description, deadline, location"}), 400

    # Prepare post data
    post_data = {
        "userID": data["userID"],
        "description": data["description"],
        "postType": data["postType"],
        "deadline": data["deadline"],
        "location": data["location"],
        "mediaURL": data["mediaURL"],
        "tags": data["tags"],
        "createdOn": data["createdOn"]
    }

    # Create new post
    new_post = Post(**{k: v for k, v in post_data.items()})
    print("New post to be added:", new_post.to_json())      

    try:
        db.session.add(new_post)
        
        db.session.commit()
        print("New post added:", new_post)
    except Exception as e:
        return jsonify({"message": str(e)}), 400
        
    
    return jsonify({"message": "Post added!"}), 201