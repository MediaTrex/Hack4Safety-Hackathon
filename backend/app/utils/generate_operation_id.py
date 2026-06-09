from datetime import datetime, timezone
from app.config.database import get_collection

async def generate_operation_id() -> str:
    operations_col = await get_collection("operations")

    now = datetime.now(timezone.utc)

    date_str = now.strftime("%Y-%m-%d")

    start_of_day = datetime(
        now.year,
        now.month,
        now.day,
        tzinfo=timezone.utc,
    )

    end_of_day = datetime(
        now.year,
        now.month,
        now.day,
        23,
        59,
        59,
        999999,
        tzinfo=timezone.utc,
    )

    count = await operations_col.count_documents(
        {
            "created_at": {
                "$gte": start_of_day,
                "$lte": end_of_day,
            }
        }
    )

    sequence = count + 1

    return f"OS-{date_str}-{sequence}"