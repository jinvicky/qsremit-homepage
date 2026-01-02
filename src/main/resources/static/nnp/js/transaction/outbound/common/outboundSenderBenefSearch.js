/**
 * Sender Page data 로드 함수
 */
function loadPage(page, searchField, keyword, size) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/transaction/transactionOutboundHistorySend/search/${encodeURIComponent(searchField)}`,
            data: {
                keyword: keyword,
                page: page,
                size: size
            },
            success: function (res) {
                const { content, totalPages, number: currentPage } = res;

                const mappedSenders = renderTable(content);

                createPagination(currentPage, totalPages, searchField, keyword, size);

                resolve(mappedSenders); // Promise 성공 시 데이터 반환
            },
            error: function (err) {
                console.error("Error during AJAX call:", err);
                alert("An error occurred!");
                reject(err); // Promise 실패
            }
        });
    });
}

/**
 * Sender Search 테이블 렌더링 함수
 */
function renderTable(res) {
    let mappedSenders = [];
    const $tbody = $("#searchResultsTable tbody");
    $tbody.empty();
    if (!res || res.length === 0) {
        $("#searchResultsContainer").addClass("d-none");
        alert("No search results found.");
        return;
    }

    $('#paginationContainer .pagination').on('click', 'li.page-item', function() {
        $(this).addClass('active').siblings().removeClass('active');
    });
    $("#searchResultsContainer").removeClass("d-none");
    mappedSenders = res.map(sender => ({
        id: sender.id,
        customerId: sender.customerId,
        fullName: sender.senderName,
        optionName: sender.senderOptionName.trim(),
        email: sender.email,
        mobile: sender.contact,
        nationality: sender.nationality || "",
        gender: sender.gender || "",
        address: [`〒${sender.address.zipcode}`, sender.address.street, sender.address.city, sender.address.state]
            .filter(Boolean).join(', '),
        TotalRemittance: sender.totalRemittance
            ? parseFloat(sender.totalRemittance).toLocaleString()
            : "0",
        kycstatus: sender.kycstatus,
        customerType: sender.customerType,
    }));
    mappedSenders.forEach(sender => {
        const $tr = $("<tr>");
        $tr.append($("<td>").html(sender.customerId));
        $tr.append($("<td>").html(`
            <p class="m-0 text-truncate" style="width: 220px">${sender.fullName}</p>
            <p class="m-0 text-truncate" style="width: 220px">${sender.optionName}</p>
        `));
        $tr.append($("<td>").html(sender.email));
        $tr.append($("<td>").html(sender.mobile));
        $tr.append($("<td>").html(sender.address));
        $tr.append($("<td>").html(sender.TotalRemittance + " JPY"));
        $tr.append($("<td>").html(sender.kycstatus || ""));
        const $selectBtn = $("<button>")
            .addClass("btn btn-sm")
            .text("Select")
            .attr("data-id", sender.id);

        const isValidKycStatus = ["COMPLETED", "READ"].includes(sender.kycstatus);
        $selectBtn.addClass(isValidKycStatus ? "btn-primary" : "btn-secondary")
            .prop("disabled", !isValidKycStatus)
            .css("cursor", isValidKycStatus ? "pointer" : "not-allowed");

        $tr.append($("<td>").append($selectBtn));
        $tbody.append($tr);
    })

    const currentYear = new Date().getFullYear();
    $("#calculationPeriodText").text(`from ${currentYear}-01-01 to ${currentYear}-12-31.`);

    return mappedSenders;
}

/**
 * pagination 생성 함수
 */
function createPagination(currentPage, totalPages, searchField, keyword, size) {
    const $pagination = $("#pagination");
    $pagination.empty();

    const $prev = $('<li class="page-item">')
        .addClass(currentPage === 0 ? "disabled" : "")
        .append(
            $('<a class="page-link" href="javascript:void(0);" aria-label="Previous">')
                .html('<span aria-hidden="true">«</span>')
                .on("click", function () {
                    if (currentPage > 0) loadPage(currentPage - 1, searchField, keyword, size);
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

/**
 * sender search 시 에 반영된 sander Id를 바탕으로 드롭다운에 표시되는 수령자의 정보를 가져옴
 * @param senderId
 */
function fetchBeneficiaries(senderId) {
    $.ajax({
        type: "GET",
        url: `/transaction/transactionOutboundHistorySend/beneficiary/${senderId}`,
        success: function (res) {

            const mappedBeneficiaries = res.map(beneficiary => ({
                id: beneficiary.id,
                fullName: [beneficiary.firstName, beneficiary.middleName, beneficiary.lastName]
                    .filter(Boolean).join(' '),
                firstName: beneficiary.firstName,
                middleName: beneficiary.middleName,
                lastName: beneficiary.lastName,
                gender: beneficiary.gender,
                payment: beneficiary.payoutType,
                bank: beneficiary.payoutBank,
                branch: beneficiary.payoutBranch,
                accountNo: beneficiary.accountNumber,
                relation: beneficiary.relation,
                incomeSource: beneficiary.incomeSource,
                transactionReason: beneficiary.transactionReason,
                country: beneficiary.country || "N/A",
                partnerId: beneficiary.partnerId || "N/A",
                mobile: beneficiary.mobile || "N/A",
                address: beneficiary.address || "N/A",
                chooseType: beneficiary.registrationType || "N/A",
                beneficiaryNationality: beneficiary.nationality || "N/A",
                idType: beneficiary.idType || "N/A",
                idNumber: beneficiary.idNumber || "N/A",
            }));

            if ($('#chooseBeneficiary')[0]?.selectize) {
                $('#chooseBeneficiary')[0].selectize.destroy();
                $("#chooseBeneficiary").html('<option value="">Select</option>');
            }
            $("#chooseBeneficiary").selectize({
                options: mappedBeneficiaries,
                persist: false,
                labelField: "fullName",
                valueField: "id",
                searchField: "fullName",
                maxItems: 1,
                openOnFocus: false,
                create: false,
                onChange: function (value) {
                    if (!value) return;
                    const selectedBeneficiary = mappedBeneficiaries.find(b => b.id == value);
                    if (selectedBeneficiary) {
                        $("#beneficiaryId").val(selectedBeneficiary.id);
                        $("#payoutCountrySelect").val(selectedBeneficiary.country || "").trigger("change");
                        $("#typeSelect").val(selectedBeneficiary.partnerId || "").trigger("change");
                        $("#firstName").val(unescapeSpecialCharacters(selectedBeneficiary.firstName) || "");
                        $("#middleName").val(unescapeSpecialCharacters(selectedBeneficiary.middleName) || "");
                        $("#lastName").val(unescapeSpecialCharacters(selectedBeneficiary.lastName) || "");
                        $("#phone").val(unescapeSpecialCharacters(selectedBeneficiary.mobile) || "").trigger("input");
                        $("#address").val(unescapeSpecialCharacters(selectedBeneficiary.address) || "");
                        $("#beneficiaryNationality").val(unescapeSpecialCharacters(selectedBeneficiary.beneficiaryNationality) || "");
                        $("#paymentType").val(unescapeSpecialCharacters(selectedBeneficiary.payment) || "").trigger("change");
                        $("#relToBeneficiary").val(unescapeSpecialCharacters(selectedBeneficiary.relation) || "");
                        $("#sourceOfIncome").val(unescapeSpecialCharacters(selectedBeneficiary.incomeSource) || "");
                        $("#purposeOfRemittance").val(unescapeSpecialCharacters(selectedBeneficiary.transactionReason) || "");
                        $("#idType").val(unescapeSpecialCharacters(selectedBeneficiary.idType) || "");
                        $("#idNumber").val(unescapeSpecialCharacters(selectedBeneficiary.idNumber) || "");

                        const type = unescapeSpecialCharacters(selectedBeneficiary.chooseType)
                        if (type === "INDIVIDUAL") {
                            $("#individual").prop("checked", true)
                        } else if (type === "COMPANY") {
                            $("#company").prop("checked", true)
                        }

                        const gender = unescapeSpecialCharacters(selectedBeneficiary.gender)
                        if (gender === "MALE") {
                            $("#male").prop("checked", true);
                        } else if (gender === "FEMALE") {
                            $("#female").prop("checked", true);
                        }

                        togglePaymentFields(selectedBeneficiary.payment);
                        selectBankAndBranch(selectedBeneficiary);

                    }
                }
            });

        },
        error: function (err) {
            console.error("Beneficiaries 검색 에러:", err);
        }
    });
}

/**
 * sender search 시 에 반영된 sander Id를 바탕으로 importBeneficiaryHistory표시되는 수령자의 정보를 가져옴
 * @param senderId
 */
function importBeneficiaryHistory(senderId) {
    isBeneficiaryHistoryLoading = true;
    $('#con-close-modal').on('shown.bs.modal', function () {
        $.ajax({
            type: "GET",
            url: `/transaction/transactionOutboundHistorySend/importBeneficiaryHistory/${senderId}`,
            dataType: "json",
            success: function (response) {
                let table = $("#beneficiaryHistoryContent table").DataTable();
                table.clear();
                response.forEach(function (item) {
                    const fullName = [
                        item.beneficiary?.beneficiaryName?.lastName,
                        item.beneficiary?.beneficiaryName?.middleName,
                        item.beneficiary?.beneficiaryName?.firstName
                    ].filter(Boolean).join(" ");
                    table.row.add({
                        transactionId: item.transactionId,
                        beneficiary: item.beneficiary,
                        beneficiaryName: fullName,
                        type: item.type,
                        // point: item.point,
                        country: item.country,
                        countryName: item.countryName,
                        collected: item.collected,
                        received: item.received,
                        fee: item.fee,
                        transactionDate: item.transactionDate
                    });
                });
                table.draw()
            },
            error: function (xhr, status, error) {
                console.error("데이터 가져오기 오류:", error);
            }
        });
    });
}

/**
 * 입력된 Beneficiary 정보 초기화
 */
function removeBeneficiaryInfo() {
    $("#firstName").val("");
    $("#middleName").val("");
    $("#lastName").val("");
    $("#phone").val("");
    $("#address").val("");
    $("#beneficiaryNationality").val("");
    $("#relToBeneficiary").val("");
    $("#sourceOfIncome").val("");
    $("#purposeOfRemittance").val("");

    $("#individual").prop("checked", false)
    $("#company").prop("checked", false)

    $("#male").prop("checked", true);
    $("#female").prop("checked", false);
}