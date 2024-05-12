

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

module.exports = Papers;