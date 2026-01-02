function loadPage(page, nationality, searchField, keyword, size, type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/api/systemManagement/emailManagement/receiver/search/${encodeURIComponent(searchField)}`,
            data: {
                keyword: keyword,
                nationality: nationality,
            },
            success: function (res) {
                const { content, totalPages, number: currentPage } = res;

                renderTable(content, type);
                createPagination(currentPage, totalPages, nationality, searchField, keyword, size);

            },
            error: function (err) {
                console.error("Error during AJAX call:", err);
                alert("An error occurred!");
                reject(err); // Promise 실패
            }
        });
    });
}

function renderTable(res, type) {
    let mappedSenders = [];
    const $tbody = $("#selectReceiverTable tbody");
    $tbody.empty();
    if (!res || res.length === 0) {
        $("#searchResultsContainer").addClass("d-none");
        alert("**No search results found.");
        return;
    }

    $("#searchResultsContainer").removeClass("d-none");
    mappedSenders = res.map(sender => ({
        id: sender.id,
        customerId: sender.customerId,
        fullName: sender.senderName,
        email: sender.email,
        mobile: sender.contact,
        nationality: sender.nationality || "",
        gender: sender.gender || "",
        address: [sender.address.zipcode, sender.address.street, sender.address.city, sender.address.state]
            .filter(Boolean).join(', '),
        kycstatus: sender.kycstatus,
        expired: sender.idCardValidDate
    }));
    mappedSenders.forEach(sender => {
        const $selectCheckbox = $("<input type=\"checkbox\">")
            .addClass("btn btn-sm")
            .attr("data-id", sender.id)
            .attr("data-mobile", sender.mobile);


        const $tr = $("<tr>").attr("data-id", sender.id).attr("data-mobile", sender.mobile);
        $tr.append($("<td>").append($selectCheckbox));
        $tr.append($("<td>").text(sender.customerId));
        $tr.append($("<td>").html(`<p class="m-0 text-truncate" style="width: 150px">${sender.fullName}</p>`));
        if (type === "mobile") {
            $tr.append($("<td>").text(sender.mobile));

            if (sender.mobile === "") {
                $selectCheckbox.prop("disabled", true);
                $tr.css("background-color", "#f5f5f5");
            }
        } else {
            $tr.append($("<td>").text(sender.email));

            if (sender.email === "") {
                $selectCheckbox.prop("disabled", true);
                $tr.css("background-color", "#f5f5f5");
            }
        }
        $tr.append($("<td>").text(sender.nationality || ""));
        $tr.append($("<td>").text(sender.kycstatus || ""));
        $tr.append($("<td>").text(checkIdCardValidity(sender.expired)));

        $tbody.append($tr);
    });

    const currentYear = new Date().getFullYear();
    $("#calculationPeriodText").text(`from ${currentYear}-01-01 to ${currentYear}-12-31.`);

    return mappedSenders;
}

// Receiver의 Expiration 체크 함수
function checkIdCardValidity(idCardValidDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDate = new Date(idCardValidDate);

    if (validDate > today) {
        const diffInMs = validDate - today;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        return `${diffInDays} DAY(s) left`;
    } else {
        return "EXPIRED";
    }
}

function createPagination(currentPage, totalPages, nationality, searchField, keyword, size) {
    const $pagination = $("#pagination");
    $pagination.empty();

    const $prev = $('<li class="page-item">')
        .addClass(currentPage === 0 ? "disabled" : "")
        .append(
            $('<a class="page-link" href="javascript:void(0);" aria-label="Previous">')
                .html('<span aria-hidden="true">«</span>')
                .on("click", function () {
                    if (currentPage > 0) loadPage(currentPage - 1, nationality, searchField, keyword, size);
                })
        );
    $pagination.append($prev);

    // 페이지 번호 버튼 생성 (현재 페이지를 중심으로 일정 범위만 표시)
    const range = 2; // 현재 페이지 기준 ±2 범위만 표시
    const startPage = Math.max(0, currentPage - range);
    const endPage = Math.min(totalPages - 1, currentPage + range);

    if (startPage > 0) {
        // 첫 번째 페이지 링크 추가
        $pagination.append(
            $('<li class="page-item">')
                .append(
                    $('<a class="page-link" href="javascript:void(0);">')
                        .text(1)
                        .on("click", function () {
                            loadPage(0, searchField, keyword, size);
                        })
                )
        );

        if (startPage > 1) {
            // 생략 표시
            $pagination.append($('<li class="page-item disabled"><span class="page-link">...</span></li>'));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        $pagination.append(
            $('<li class="page-item">')
                .addClass(i === currentPage ? "active" : "")
                .append(
                    $('<a class="page-link" href="javascript:void(0);">')
                        .text(i + 1) // 0 기반 페이지를 1 기반으로 표시
                        .on("click", function () {
                            loadPage(i, searchField, keyword, size);
                        })
                )
        );
    }

    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            // 생략 표시
            $pagination.append($('<li class="page-item disabled"><span class="page-link">...</span></li>'));
        }

        // 마지막 페이지 링크 추가
        $pagination.append(
            $('<li class="page-item">')
                .append(
                    $('<a class="page-link" href="javascript:void(0);">')
                        .text(totalPages)
                        .on("click", function () {
                            loadPage(totalPages - 1, searchField, keyword, size);
                        })
                )
        );
    }

    // 다음 버튼 생성
    const $next = $('<li class="page-item">')
        .addClass(currentPage === totalPages - 1 ? "disabled" : "")
        .append(
            $('<a class="page-link" href="javascript:void(0);" aria-label="Next">')
                .html('<span aria-hidden="true">»</span>')
                .on("click", function () {
                    if (currentPage < totalPages - 1) loadPage(currentPage + 1, searchField, keyword, size);
                })
        );
    $pagination.append($next);
}