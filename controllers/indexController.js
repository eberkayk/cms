class IndexController {
    constructor(indexModel) {
        this.indexModel = indexModel;
    }

    async handleRequest(req, res) {
        try {
            const data = await this.indexModel.getData();
            res.json(data);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

module.exports = IndexController;