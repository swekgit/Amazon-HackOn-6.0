from app.database import customers_collection
from app.ai_service import generate_predicted_churn_reason

customer = customers_collection.find_one()

reason = generate_predicted_churn_reason(customer)

print(reason)