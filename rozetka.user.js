// ==UserScript==
// @name Popup
// @description Rozetka Popup  with additional filters
// @author Evgen Kich
// @license MIT
// @version 1.0
// @match https://rozetka.com.ua/search/*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require https://gist.github.com/BrockA/2625891/raw/waitForKeyElements.js
// @grant GM_addStyle
// ==/UserScript==

(function (window, undefined) {
    "use strict";
    let w;
    if (typeof window != undefined) {
        w = window;
    }

    if (w.self != w.top) {
        return;
    }

    waitForKeyElements(".catalog", appendFilterButton);
    waitForKeyElements(".catalog-grid", filterCatalogItems);
    waitForKeyElements(".central-wrapper", createPopup);
    waitForKeyElements("#modal-one", togglePopup);

    function createButton() {
        const button = document.createElement("div");
        button.innerHTML =
            '<button class="filterButton" data-modal="modal-one">Фільтри</button>';
        return button;
    }

    function appendFilterButton() {
        const catalog = document.querySelector(".catalog");
        return catalog.append(createButton());
    }

    function createPopup() {
        const pageWrapper = document.querySelector(".central-wrapper");
        const popupWrapper = document.createElement("div");
        popupWrapper.innerHTML =
            '<div class="modal open" id="modal-one"><div class="modal-bg modal-exit"></div><div class="modal-container"><form class="modal-form" id="form"><h2 class="modal-header">Фільтри</h2><div class="row"><div class="filter-name">Дисконт</div><select class="select discount-select" name="discount"><option class="select-option" value="all">Всі</option><option class="select-option" value="with-discount">Акційні</option><option class="select-option" value="without-discount">Без знижок</option></select></div><div class="row"><div class="filter-name">По продажах</div><select class="select sale-select" name="sale"><option class="select-option" value="all">Всі</option><option class="select-option" value="top">Топ продаж</option></select></div><button class="filter-approve button">Фільтрувати</button><button class="modal-close modal-exit button">Закрити</button></div></form></div>';
        return pageWrapper.append(popupWrapper);
    }

    function togglePopup() {
        const modals = document.querySelectorAll("[data-modal]");
        modals.forEach(function (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                const modal = document.getElementById("modal-one");
                modal.classList.add("open");
                const exits = modal.querySelectorAll(".modal-exit");
                exits.forEach(function (exit) {
                    exit.addEventListener("click", function (event) {
                        event.preventDefault();
                        modal.classList.remove("open");
                    });
                });
            });
        });
    }

    function filterCatalogItems() {
        const nodes = document.querySelectorAll(".catalog-grid__cell");
        const catalogItems = Array.from(nodes);
        const catalogGrid = document.querySelector(".catalog-grid");
        const form = document.querySelector(".modal-form");
        const modal = document.getElementById("modal-one");

        let modifiedNodes;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const discountSelect = document.querySelector(".discount-select");
            const saleSelect = document.querySelector(".sale-select");

            const filteredDiscountCatalogItems =
                getFilteredDiscountCatalogItems(
                    discountSelect.value,
                    catalogItems
                );

            const filteredSalesDiscountCatalogItems =
                getFilteredSalesCatalogItems(saleSelect.value, catalogItems);

            modifiedNodes = arrayToNodeList([
                ...filteredDiscountCatalogItems,
                ...filteredSalesDiscountCatalogItems,
            ]);

            while (catalogGrid.firstChild) {
                catalogGrid.removeChild(catalogGrid.firstChild);
            }

            modifiedNodes.forEach((node) => {
                catalogGrid.appendChild(node);
            });

            modal.classList.remove("open");
        });
    }

    function getFilteredDiscountCatalogItems(selectValue, catalogItems) {
        let filteredCatalogItems;
        switch (selectValue) {
            case "with-discount":
                filteredCatalogItems = filterList(
                    catalogItems,
                    "promo-label_type_action"
                );
                break;
            case "without-discount":
                filteredCatalogItems = filterWithoutDiscountList(
                    catalogItems,
                    "promo-label_type_action"
                );
                break;
            case "all":
                filteredCatalogItems = catalogItems;
                break;
            default:
                return;
        }
        return filteredCatalogItems;
    }

    function getFilteredSalesCatalogItems(selectValue, catalogItems) {
        let filteredSalesCatalogItems;
        switch (selectValue) {
            case "top":
                filteredSalesCatalogItems = filterList(
                    catalogItems,
                    "promo-label_type_popularity"
                );
                break;
            case "all":
                filteredSalesCatalogItems = catalogItems;
                break;
            default:
                return;
        }
        return filteredSalesCatalogItems;
    }

    function filterList(list, type) {
        return list.filter((item) =>
            item.children[0]?.children[0]?.children[0]?.children[1]?.children[0]?.children[0].classList.contains(
                type
            )
        );
    }

    function filterWithoutDiscountList(list, type) {
        return list.filter(
            (item) =>
                !item.children[0]?.children[0]?.children[0]?.children[1]?.children[0]?.children[0].classList.contains(
                    type
                )
        );
    }

    function arrayToNodeList(arrayOfNodes) {
        var fragment = document.createDocumentFragment();
        arrayOfNodes.forEach(function (item) {
            fragment.appendChild(item.cloneNode(true));
        });
        return fragment.childNodes;
    }

    GM_addStyle(`
    .filterButton {
        position: fixed;
        top: 95vh;
        right: 5px;
        height: 32px;
        color: #fff;
        background-color: #3e77aa;
        border: 1px solid #3e77aa;
        border-radius: 3px;
        z-index: 1500;
    }
    .modal {
       position: fixed;
       width: 100vw;
       height: 100vh;
       opacity: 0;
       visibility: hidden;
       transition: all 0.3s ease;
       top: 0;
       left: 0;
       display: flex;
       align-items: center;
       justify-content: center;
       z-index: 2000;
    }
    .modal-header {
       align-self: center;
       font-size: 20px;
    }
    .modal.open {
        visibility: visible;
        opacity: 1;
        transition-delay: 0s;
    }
    .modal-bg {
        position: absolute;
        background: rgba(255, 255, 255, 0.5);
        width: 100%;
        height: 100%;
    }
    .modal-container {
        position: relative;
        min-height: 230px;
        min-width: 350px;
        padding: 30px;
        background: #fff;
        border: 1px solid #3e77aa;
        border-radius: 5px;
    }
    .button {
        height: 25px;
        min-width: 100px;
        color: #fff;
        background-color: #3e77aa;
        border: 1px solid #3e77aa;
        border-radius: 3px;
    }
    .modal-close {
        position: absolute;
        left: 30px;
        bottom: 20px;
         color: #f84147;
          background-color: #fff;
         border: 1px solid grey;
         border-radius: 3px;
    }
    .filter-approve {
        position: absolute;
        right: 30px;
        bottom: 20px;
    }
    .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
    }
    .filter-name {
        font-size: 14px
    }
    .select {
        min-width: 110px;
        padding: 3px;
        border-radius: 4px;
    }



}`);
})(window);
