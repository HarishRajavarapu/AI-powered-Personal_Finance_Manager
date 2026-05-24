from bson import ObjectId


def object_id(id_value: str) -> ObjectId:
    if not ObjectId.is_valid(id_value):
        raise ValueError("Invalid id.")
    return ObjectId(id_value)


def serialize_document(document: dict | None) -> dict | None:
    if document is None:
        return None

    serialized = dict(document)
    serialized["id"] = str(serialized.pop("_id"))
    return serialized

