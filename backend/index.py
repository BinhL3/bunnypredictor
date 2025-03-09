import joblib
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from flask_cors import CORS

model_data = joblib.load('model.pkl')
Theta = model_data['Theta']
mean = model_data['mean']
std = model_data['std']
threshold = model_data['threshold']

print("Mean shape:", mean.shape)
print("Std shape:", std.shape)


app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return 'Server listening on 3001'

@app.route('/api')
def api():
    return jsonify({'message': 'Hello from server!'})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    try:
        features = np.array(data['features']).reshape(1, -1)

        features = (features - mean) / std
        features = np.insert(features, 0, 1, axis=1)

        def sigmoid(z):
            return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

        probability = sigmoid(features @ Theta)
        prediction = 1 if probability >= threshold else 0

        return jsonify({
            'probability': float(probability),
            'prediction': prediction
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=3001, debug=True)
