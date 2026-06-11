def compare_products(results):

    if len(results) < 2:
        return []

    winner = results[0]

    output = []

    for competitor in results[1:4]:

        reasons = []

        score_gap = round(
            winner["score"] - competitor["score"],
            2
        )

        reasons.append(
            f"Score advantage: {score_gap}"
        )

        if winner.get("tag_matches", 0) > competitor.get("tag_matches", 0):

            reasons.append(
                "More customer tag matches"
            )

        output.append({

            "loser": competitor["title"],
            "reasons": reasons
        })

    return output