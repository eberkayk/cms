class User {
    constructor(username, email, password, role, expertise) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.expertise = expertise;
    }


}





class Reviewer {
    constructor(username, email, expertise) {
        this.username = username;
        this.email = email;
        this.expertise = expertise;

    }

}





class ReviewerPapers {
    constructor(reviewerName, paperId) {
        this.reviewerName = reviewerName;
        this.paperId = paperId;
    }
}


class Reviews {
    constructor(id, paperId, reviewerName) {
        this.id = id;
        this.paperId = paperId;
        this.reviewerName = reviewerName;
    }
}


class Papers {
    constructor(id, title, abstract, keywords, filename, status, expertise) {
        this.id = id;
        this.title = title;
        this.abstract = abstract;
        this.keywords = keywords;
        this.filename = filename;
        this.status = status;
        this.expertise = expertise;
    }
}


class Conference {
    constructor(title, description, venue, date, schedule) {
        this.title = title;
        this.description = description;
        this.venue = venue;
        this.date = date;
        this.schedule = schedule;
    }
}

module.exports = {
    User,
    Reviewer,
    ReviewerPapers,
    Reviews,
    Papers,
    Conference
};