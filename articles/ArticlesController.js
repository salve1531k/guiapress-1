const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Articles");
const slugify = require("slugify");

// Listar todos os imóveis
router.get("/admin/articles", (req, res) => {
    Article.findAll({
        include: [{ model: Category }]
    }).then(articles => {
        res.render("admin/articles/index", { articles });
    }).catch(err => {
        console.error("Erro ao buscar imóveis:", err);
        res.redirect("/");
    });
});

// Formulário para criar novo imóvel
router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", { categories });
    }).catch(err => {
        console.error("Erro ao carregar categorias:", err);
        res.redirect("/admin/articles");
    });
});

// Salvar ou atualizar imóvel
router.post("/articles/save", (req, res) => {
    const { id, title, body, category, photo } = req.body;

    if (!title || !body || !category) {
        return res.redirect("/admin/articles");
    }

    if (id) {
        // Atualizar imóvel existente
        let updateData = {
            title: title,
            slug: slugify(title),
            body: body,
            categoryId: category,
            photo: photo
        };

        Article.update(updateData, {
            where: { id: id }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(err => {
            console.error("Erro ao atualizar imóvel:", err);
            res.redirect("/admin/articles");
        });
    } else {
        // Criar novo imóvel
        Article.create({
            title: title,
            slug: slugify(title),
            body: body,
            categoryId: category,
            photo: photo
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(err => {
            console.error("Erro ao salvar imóvel:", err);
            res.redirect("/admin/articles/new");
        });
    }
});

// Deletar imóvel
router.post("/articles/delete", (req, res) => {
    const id = req.body.id;

    if (id && !isNaN(id)) {
        Article.destroy({
            where: { id: id }
        }).then(() => {
            console.log("Imóvel deletado, ID:", id);
            res.redirect("/admin/articles");
        }).catch(err => {
            console.error("Erro ao deletar imóvel:", err);
            res.redirect("/admin/articles");
        });
    } else {
        res.redirect("/admin/articles");
    }
});

// Editar imóvel
router.get("/admin/articles/edit/:id", (req, res) => {
    const id = req.params.id;

    Article.findByPk(id).then(article => {
        if (article) {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {
                    article: article,
                    categories: categories
                });
            }).catch(err => {
                console.error("Erro ao buscar categorias:", err);
                res.redirect("/admin/articles");
            });
        } else {
            res.redirect("/admin/articles");
        }
    }).catch(err => {
        console.error("Erro ao buscar imóvel:", err);
        res.redirect("/admin/articles");
    });
});

module.exports = router;
