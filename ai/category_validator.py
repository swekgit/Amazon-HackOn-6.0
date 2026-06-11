def category_match(query_category, title):

    if not query_category:
        return True

    query_category = query_category.lower()
    title = title.lower()

    for word in query_category.split():

        if word in title:
            return True

    return False