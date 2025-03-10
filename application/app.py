import pickle
import json
import numpy as np
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Load the trained model
with open('banglore_home_prices_model.pickle', 'rb') as f:
    model = pickle.load(f)

# Load the column data
with open('columns.json', 'r') as f:
    data_columns = json.load(f)['data_columns']
    locations = data_columns[3:]  # First 3 are sqft, bath, bhk

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/api/locations', methods=['GET'])
def get_locations():
    return jsonify(locations)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        total_sqft = float(request.form['sqft'])
        location = request.form['location']
        bhk = int(request.form['bhk'])
        bath = int(request.form['bath'])
        
        # Input validation
        if total_sqft < 300:
            return jsonify({'error': 'Square feet area should be at least 300 sqft'})
        
        # Prepare input for model
        loc_index = data_columns.index(location.lower()) if location.lower() in data_columns else -1
        
        x = np.zeros(len(data_columns))
        x[0] = total_sqft
        x[1] = bath
        x[2] = bhk
        if loc_index >= 0:
            x[loc_index] = 1
        
        # Make prediction
        prediction = round(float(model.predict([x])[0]), 2)
        
        # Convert to Lakhs (formatted)
        result = f"₹{prediction} Lakhs"
        
        return jsonify({'prediction': result})
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    # app.run(debug=True, port=5328)
    import os
    port = int(os.environ.get("PORT", 5328))  # Use PORT from environment variable
    app.run(host="0.0.0.0", port=port, debug=True)
    app.run(debug=True)
    

