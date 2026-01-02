let content;

document.addEventListener("DOMContentLoaded", function () {
    content = document.querySelector(".content-page .content").outerHTML
});

$(document).ready(function() {
    const maxTabs = 10;
    const tabsContainer = document.getElementById("tabs");
    const user = JSON.parse(Cookies.get("user"));
    const lastLogin = JSON.parse(sessionStorage.getItem("lastLogin"));
    let tabs = JSON.parse(sessionStorage.getItem("tabs")) || [];

    let existingTab;

    document.querySelectorAll("input, textarea, select").forEach(el => {
        el.addEventListener("change", function() {
            savePage();
        });
    });

    $('[data-provide="datepicker"]').each(function () {
        $(this).on("changeDate", function() {
            savePage();
        });
    });

    // =========== Save Tab ================
    function savePage(
        title = document.querySelector(".content-page .page-title").innerText.trim(),
        url = window.location.pathname.trim() + window.location.search.trim(),
        nextUrl = url) {
        const contentArea = document.querySelector(".content-page");
        // URL이 이미 존재하는지 확인
        let existingTab;
        const urlPatterns = [
            "newCustomer",
            "transactionOutboundHistorySend",
            "serviceChargeManagementEdit"
        ];

        for (const pattern of urlPatterns) {
            if (url.includes(pattern) && nextUrl.includes(pattern)) {
                const index = tabs.findIndex(tab => tab.url.includes(pattern));
                if (index > 0) {
                    existingTab = tabs[index];
                    existingTab.content = content;
                    existingTab.url = url;
                    break;
                }
            }
        }
        if (!existingTab) {
            existingTab = tabs.find(tab => tab.url === url);
        }

        // script 태그 따로 저장
        const scripts = [];
        document.querySelectorAll("script").forEach(script => {
            if (script.src && script.src.includes("nnp/js")
                && !script.src.includes("/nnp/js/dataTableCommon")
                && !script.src.includes("/nnp/js/common/pageTabs")) {
                scripts.push(script.src.replace(/^https?:\/\/[^/]+/, "")); // src 경로만 저장
            }
        });

        // 현재 페이지의 input 값들을 저장
        const inputs = contentArea.querySelectorAll("input, textarea, select");
        const inputValues = {};
        inputs.forEach(input => {
            if (input.type === "checkbox" || input.type === "radio") {
                inputValues[input.id] = input.checked; // checked 상태 저장
            } else {
                inputValues[input.name || input.id] = input.value;  // value 저장
            }
        });

        const newTab = { title, url, content, inputValues, scripts };

        if (!existingTab) {
            tabs.push(newTab);
        } else {
            // existingTab.content = content;
            existingTab.inputValues = inputValues;
        }

        sessionStorage.setItem("tabs", JSON.stringify(tabs));
        $(".remove-all-tabs").css("display", "block");
    }

    // ========== Render Tab ===============
    function renderTab(activeUrl =  window.location.pathname.trim() + window.location.search.trim()) {
        tabsContainer.textContent = "";
        tabs.forEach(tab => {
            const tabElement = document.createElement("li");
            tabElement.classList.add("nav-item");
            const tabLink = document.createElement("a");
            tabLink.classList.add("nav-link");
            if (tab.url === activeUrl) {
                tabLink.classList.add("active");
            } else {
                tabLink.classList.remove("active");
            }

            if (tab.url.includes("customerDetail")) {
                tabLink.style.fontSize = "13px";
            }

            tabLink.href = tab.url;
            tabLink.textContent = '';
            tabLink.appendChild(document.createTextNode(tab.title));
            const icon = document.createElement('i');
            icon.classList.add('fe-x', 'remove-tab', 'ps-2');
            tabLink.appendChild(icon);

            tabElement.appendChild(tabLink);
            tabsContainer.appendChild(tabElement);
        });
    }

    // ========== Remove Tab ===============
    $(document).on("click", "#header .page-tabs .remove-tab", function(event) {
        event.preventDefault();
        event.stopPropagation();

        const tabIndex = $(this).closest("li").index();
        tabs.splice(tabIndex, 1);
        sessionStorage.setItem("tabs", JSON.stringify(tabs));

        if (tabs.length === 0) {
            if (user.userType.includes("EC")) {
                return window.location.href = "/pgManagement/accountDepositManagement";
            } else {
                return window.location.href = "/";
            }
        }

        if (!$(this).parents("a").hasClass("active")) {
            return renderTab();
        }

        const activeTab = tabs[tabs.length - 1];
        window.history.pushState(null, '', activeTab.url);
        renderTab(activeTab.url);
        renderContent(activeTab.url);
    });

    // ========= Remove All Tabs ===========
    $(".remove-all-tabs").on("click", function() {
        tabs = [];
        sessionStorage.setItem("tabs", JSON.stringify(tabs));
        if (user.userType.includes("EC")) {
            return window.location.href = "/pgManagement/accountDepositManagement";
        } else {
            return window.location.href = "/";
        }
    });

    // ========= Render Content ============
    function renderContent(activeUrl) {
        const activeTab = tabs.find(tab => tab.url === activeUrl);

        if (!activeTab && confirm("Nothing written. Do you want to go to the home page?")) {
            if (user.userType.includes("EC")) {
                window.location.href = "/pgManagement/accountDepositManagement";
            } else {
                window.location.href = "/";
            }
            return;
        }

        const contentArea = document.querySelector(".content-page");
        contentArea.innerHTML = activeTab.content;

        const inputs = contentArea.querySelectorAll("input, textarea, select");
        inputs.forEach(input => {
            const savedValue = activeTab.inputValues[input.id];
            if (savedValue !== undefined) {
                if (input.type === "checkbox" || input.type === "radio") {
                    input.checked = savedValue; // checked 상태 복원
                } else {
                    input.value = savedValue; // value 복원
                }
            }
        });

        executeScripts(activeTab.scripts);
    }

    // ========= Execute Scripts ===========
    function executeScripts(scripts) {
        scripts.forEach(scriptTextOrSrc => {
            const scriptElement = document.createElement("script");
            scriptElement.src = scriptTextOrSrc;
            scriptElement.async = false;
            document.body.appendChild(scriptElement);
        });
    }

    function changeDocumentTitle(nextUrl) {
        const title = tabs.find(tab => tab.url === nextUrl).title;
        document.title = title + " | NextQSRemit v1.0";
    }

    // ========= Click Tab Menu ===========
    $(document).on("click", "#header .page-tabs a", function(event) {
        event.preventDefault();

        // 현재 페이지 변경사항 저장
        const contentArea = document.querySelector(".content-page");
        const currentTitle = contentArea.querySelector(".page-title").innerText;
        const currentTab = tabs.find(tab => tab.title === currentTitle.trim());

        const nextUrl = this.href.replace(/^https?:\/\/[^/]+/, "").trim();

        savePage(currentTab.title, currentTab.url, nextUrl);

        // 기존 nnp/js <script> 태그 삭제
        document.querySelectorAll("script").forEach(script => {
            if (script.src && script.src.includes("/nnp/js/")
                && !script.src.includes("/nnp/js/dataTableCommon")
                && !script.src.includes("/nnp/js/common/pageTabs")) {
                script.remove(); // 해당 <script> 태그 삭제
            }
        });

        window.history.pushState(null, '', nextUrl);
        renderContent(nextUrl);
        renderTab(nextUrl);
        changeDocumentTitle(nextUrl);

        setTimeout(() => {
            const searchButton = $("#searchButton, #search-button, #fxRateSearchBtn, #searchBtn, #search-btn, #searchCustomerButton");
            if (searchButton.length > 0) {
                searchButton.click();
            }
        }, 800);
    });

    $(document).on("click", ".nav-second-level a", function(event) {
        event.preventDefault();
        if (tabs.length >= maxTabs) {
            return alert("You have reached the maximum number of tabs. Please close some tabs to create a new one.");
        }

        window.location.href = this.href;
    });

    // 이벤트 완료시 텝 삭제
    $(document).on("submit", "form", function() {
        if (!window.location.href.includes("customer")) {
            deleteCurrentTab()
        }
    });
    $("#outboundSendCompleteButton").on("click", function(event) {
        event.preventDefault();
        deleteCurrentTab();
        window.location.href = "/transaction/transactionOutboundHistory";
    })

    function deleteCurrentTab() {
        const currentUrl =  window.location.pathname.trim() + window.location.search.trim(); // 현재 URL
        const tabIndex = tabs.findIndex(tab => tab.url === currentUrl); // 현재 URL에 해당하는 탭 검색

        if (tabIndex !== -1) {
            tabs.splice(tabIndex, 1);
            sessionStorage.setItem("tabs", JSON.stringify(tabs));

            renderTab();
        }
    }

    function init() {
        savePage();
        renderTab();
        // 텝 메뉴 10개 이상 제한
        if (tabs.length > maxTabs && (!existingTab || existingTab.url !== url)) {
            // 현재탭 삭제
            tabs.splice(10, 1);
            sessionStorage.setItem("tabs", JSON.stringify(tabs));

            const activeTab = tabs[9];
            window.history.pushState(null, '', activeTab.url);
            renderTab(activeTab.url);
            renderContent(activeTab.url);
            return alert("You have reached the maximum number of tabs. Please close some tabs to create a new one.");
        }
    }

    init()

    $("#logoutButton").on("click", function (e) {
        e.preventDefault();

        $.ajax({
            url: "/logout",
            type: "POST",
            success: function () {
                sessionStorage.removeItem("tabs");
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("lastLogin");
                Cookies.remove('user');

                window.location.href = "/login";
            },
            error: function (xhr, status, error) {
                console.error("Logout failed::", status, error);
                alert("Logout failed");
            },
        });
    });

    const userNameText = `<span class="pe-1">[ ${user.userType} ]</span><span class="fw-bold">${user.userId}</span>`
    $("#userName").append(userNameText);

    if (lastLogin && lastLogin.logTime) {
        const lastLoginDate = moment(lastLogin.logTime);
        const formattedDate = lastLoginDate.format('YYYY-MM-DD (ddd) HH:mm:ss');
        $("#userLog").append(`Last access: ${formattedDate}`);
    } else {
        $("#userLog").append("Last access: -");
    }

    function removeAnchorLinks() {
        const nav = document.getElementById('anchor-nav');
        if (nav) {
            nav.remove();
        }
    }

});
