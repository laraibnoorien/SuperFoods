# SmartFoodAssistant

SmartFoodAssistant is a full-stack web app that helps users track food freshness, nutrition, and recipes. It integrates AI/ML models with a responsive frontend to reduce food waste, monitor nutritional intake, and suggest personalized recipes.

---

## **Team & Features**

| Feature | Owner | Description |
|---------|-------|-------------|
| **Food Freshness Detection** | Utkarsh | Classifies food images as Fresh, Semi-Fresh, or Spoiled using CNN + Transfer Learning. Predictions are stored in the inventory database. |
| **Inventory & Expiry Tracking** | Rima | Tracks items, freshness, and predicted shelf life. Sends push notifications before spoilage and prioritizes recipes for items nearing expiry. |
| **AI-Based Calorie & Nutrition Detection** | Laraib | Identifies dishes from images and returns calories, macronutrients, and micronutrients using APIs like Edamam, Spoonacular, and USDA FoodData Central. |
| **Recipe Generation & Recommendation** | Anirban | Generates GPT-based recipes based on inventory, diet preferences, and calorie goals. Provides step-by-step instructions and nutrition breakdown. |

---

## **Project Structure**

SmartFoodAssistant/
│
├── backend/
│ ├── food_freshness/ # Utkarsh
│ │ ├── model/ # CNN models + checkpoints
│ │ ├── train.py
│ │ └── predict.py
│ │
│ ├── inventory_tracking/ # Rima
│ │ ├── db.py
│ │ ├── expiry_checker.py
│ │ └── notifications.py
│ │
│ ├── nutrition_detection/ # Laraib
│ │ ├── api_integration.py
│ │ ├── model.py
│ │ └── predict.py
│ │
│ └── recipe_generation/ # Anirban
│ ├── recipe_model.py
│ └── generate.py
│
├── frontend/ # React/Next.js + Tailwind CSS
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── styles/
│ └── package.json
│
├── database/ # SQLite or Supabase integration
│ └── inventory.db
│
├── scripts/ # Data preprocessing or utility scripts
├── requirements.txt # Python dependencies
└── README.md


---

## **Setup & Installation**

### **Backend**
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
