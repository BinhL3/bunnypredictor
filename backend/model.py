import numpy as np
import csv
import random
from sklearn.model_selection import train_test_split

random_seed = 0
random.seed(random_seed)
np.random.seed(random_seed)

data = []
with open('bunnypredictor.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    headers = next(reader)
    print("Headers:", headers)
    for i, row in enumerate(reader):
        new_row = [float(i) for i in row]
        data.append(new_row)
        if i < 2:
            print("Sample row:", new_row)

data = np.array(data)
print("Data shape:", data.shape)

X = data[:, :-1]  
Y = data[:, -1]
print("X shape:", X.shape, "Y shape:", Y.shape)
print("Y values:", Y)
print("Y distribution:", np.bincount(Y.astype(int)))

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, Y, train_size=21, test_size=9)

# Standardize
mean = np.mean(X_train, axis=0)
std = np.std(X_train, axis=0, ddof=1)
std[std == 0] = 1
X_train = (X_train - mean) / std
X_test = (X_test - mean) / std

X_train = np.insert(X_train, 0, 1, axis=1)
X_test = np.insert(X_test, 0, 1, axis=1)

# Initialize Theta
Theta = np.random.uniform(-1, 1, size=X_train.shape[1])

# Sigmoid function
def sigmoid(z):
    z = np.clip(z, -500, 500)
    return 1 / (1 + np.exp(-z))

# Gradient Descent
learning_rate = 0.001
prev_loss = float('inf')
for i in range(3000):
    cur_loss = 0
    for j in range(len(X_train)):
        y_pred = sigmoid(X_train[j] @ Theta)
        cur_loss += - (y_train[j] * np.log(y_pred + 1e-15) + (1 - y_train[j]) * np.log(1 - y_pred + 1e-15))
    cur_loss /= len(X_train)

    if abs(cur_loss - prev_loss) < 2**(-23):
        print(f"Converged at iteration {i}")
        break
    prev_loss = cur_loss

    y_pred = sigmoid(X_train @ Theta)
    Theta -= (learning_rate / len(X_train)) * X_train.T @ (y_pred - y_train)

    if i % 100 == 0:
        print(f"Iteration {i}, Loss: {cur_loss}")

print("Test probabilities:")
for i in range(len(X_test)):
    y_pred = sigmoid(X_test[i] @ Theta)
    print(f"Sample {i}: {y_pred:.4f}, Actual: {y_test[i]}")

threshold = 0.3  # Adjusted threshold
y_test_result = []
for i in range(len(X_test)):
    y_pred = sigmoid(X_test[i] @ Theta)
    y_test_result.append(1 if y_pred >= threshold else 0)

TP, FN, FP, TN = 0, 0, 0, 0
for i in range(len(y_test_result)):
    if y_test_result[i] == 1: # predicted positive
        if y_test_result[i] == y_test[i]: # positive examples
            TP += 1
        else: # negative examples
            FP += 1
    else: # predicted negative
        if y_test_result[i] == y_test[i]: # positive examples
            FN += 1
        else: # negative examples
            TN += 1
    
print("TP:", TP,"FN:", FN, "FP:", FP, "TN:", TN)
# (a) Precision:
precision = TP/(TP + FP) 
print("Precision: ", precision)
# (b) Recall:
recall = TP/(TP+FN)
print("Recall: ", recall)
# (c) F-measure:
f_measure = 2*precision*recall/(precision + recall)
print("F_measure: ",f_measure)
# (d) Accuracy:
accuracy = 0
for i in range(len(y_test_result)):
    if y_test_result[i] == y_test[i]:
        accuracy += 1
accuracy /= len(y_test)
print("Acurracy: ", accuracy)

import pickle

model_data = {
    'Theta': Theta,
    'mean': mean,
    'std': std,
    'threshold': threshold
}

with open('model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("Model saved as 'model.pkl'")
