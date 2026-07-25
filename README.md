# Machine Failure Prediction System

A comprehensive, full-stack predictive maintenance application designed to monitor industrial machinery and predict imminent failures using state-of-the-art Machine Learning models. The system combines a robust Next.js web interface with a Python-powered machine learning pipeline, providing actionable insights into machine health based on real-time sensor readings.

## ✨ Complete Functionalities

### Web Application Features
- **Secure User Authentication**: Robust registration and login system utilizing `NextAuth.js` with encrypted credentials.
- **Interactive Dashboard**: A real-time overview of your prediction statistics, including total predictions made, detected failures, and overall machine health success rates.
- **Predictive Analytics Engine**: 
  - Input live sensor readings including Air Temperature, Process Temperature, Rotational Speed, Torque, and Tool Wear.
  - Choose between multiple ML models (Logistic Regression, K-Nearest Neighbors, or an ensemble of both) to analyze the data.
  - Instantly receive a failure probability score, failure type classification, and visual risk indicators.
- **Historical Tracking**: All predictions are securely saved to MongoDB. View detailed historical logs of past predictions to track machine degradation over time.
- **Responsive UI/UX**: Built with Tailwind CSS, the interface is fully responsive, dark-mode optimized, and features smooth micro-animations for a premium user experience.

### Machine Learning Pipeline
- **Dual Model Support**: Utilizes both Logistic Regression for linear relationships and K-Nearest Neighbors (KNN) for complex pattern recognition.
- **Pre-trained Models**: Serialized models allow for rapid, low-latency inference directly inside the Node.js environment without heavy Python runtime overhead for every request.
- **Extensible Python Scripts**: Includes scripts (`predict_failure.py`, `extract_model.py`) to easily retrain models on new data (`predictive_maintenance.csv`).

## 📁 Repository Structure

```text
├── web-app/
│   ├── src/app/          # Next.js App Router pages (Dashboard, Predict, History, Auth)
│   ├── src/components/   # Reusable UI components (Navbar, Cards, Forms)
│   ├── src/lib/          # Core utilities (Mongoose schemas, Auth config, ML Inference logic)
│   ├── src/actions/      # Next.js Server Actions for secure database operations
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── extract_model.py      # Python script to extract and serialize trained ML models
├── predict_failure.py    # Python script for running raw ML predictions
├── predictive_maintenance.csv # The raw dataset used for training the ML models
├── requirements.txt      # Python dependencies (scikit-learn, pandas, numpy)
└── *.json / *.npz        # Exported model weights and KNN training data arrays
```

## 🚀 How to Run the Project in Detail

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Python** (v3.8 or higher, only needed if you wish to retrain the ML models)

### 1. Set up the Web Application

Navigate into the `web-app` directory and install the required dependencies:
```bash
cd web-app
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the `web-app` directory and add the following required configurations:

```env
# Your MongoDB connection string (local or Atlas)
MONGODB_URI="mongodb://localhost:27017/machine-failure"

# A secure random string used to encrypt NextAuth sessions
AUTH_SECRET="your-super-secret-key-change-this-in-production"

# Base URL of the application
NEXTAUTH_URL="http://localhost:3000"

# Allow NextAuth to trust the host during local development
AUTH_TRUST_HOST=true
```

### 3. Run the Development Server

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. You can now register a new account, log in, and start making predictions!

### 4. Running/Retraining the Machine Learning Models (Optional)

If you wish to experiment with the Python machine learning pipeline or retrain the models on new data, navigate to the root directory and install the Python dependencies:

```bash
pip install -r requirements.txt
```

To run a test prediction using the Python script directly:
```bash
python predict_failure.py
```

To extract and serialize the models (which updates the `.json` and `.npz` files used by the web app):
```bash
python extract_model.py
```

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js Server Actions, NextAuth.js (Auth.js)
- **Database**: MongoDB, Mongoose ODM
- **Machine Learning**: Scikit-Learn, Pandas, Numpy

