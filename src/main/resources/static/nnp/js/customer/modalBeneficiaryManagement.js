$(document).ready(function() {
    /**
     * csrf token
     * */
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    const pathname = window.location.pathname;

    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })
    /**
     * Beneficiary List Modal
     */
    let beneficiaryManagementTable;
    $("#searchBeneficiaryButton").on("click", function () {
        const beneficiaryModal = new bootstrap.Modal(document.getElementById('beneficiaryManagement'));
        $("#modalTitle").text('Beneficiary Management')

        // 이미 초기화된 DataTable 있으면 destroy 후 다시 초기화
        if ($.fn.DataTable.isDataTable("#beneficiaryManagementTable")) {
            beneficiaryManagementTable.destroy();
            $("#beneficiaryManagementTable").empty();
        }

        beneficiaryManagementTable = new DataTable("#beneficiaryManagementTable", {
            ajax: function (data, callback) {
                loadBeneficiaries(data, callback);
            },
            rowId: "beneficiaryId",
            order: [[0, 'desc']],
            serverSide: true,
            searching: false,
            pageLength: 50,
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            processing: true,
            columns: [
                { data: null, title: "No.", width: "3%", className: "dt-head-center dt-body-center" },
                { data: "lastName", title: "Name", width: "15%",
                    render: function (data, type, row) {
                        return [row.lastName, row.middleName, row.firstName]
                            .filter(Boolean)
                            .join(" ");
                    }
                },
                { data: "mobile", title: "Mobile", className: "dt-head-left dt-body-left" },
                { data: "nationality", title: "Nationality" },
                { data: "payoutPartner", title: "Partner" },
                { data: "payoutType", title: "Payout Type",
                    render: function (data, type, row) {
                        return row.payoutType.replace(/_/g, " ");
                    }
                },
                { data: "accountNumber", title: "Bank<br>Account Number",
                    render: function (data, type, row) {
                        return `${row.payoutBankName || "-"}<br>${data || "-"}`
                    }
                },
                { data: null, title: "Action",
                    render : function () {
                        return `<button type="button" id="beneficiaryEditButton" class="btn btn-primary btn-sm">Edit</button>
                                <button type="button" id="beneficiaryDeleteButton" class="btn btn-secondary btn-sm">Delete</button>
                            `
                    }
                },
            ],
            rowCallback: function (row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(0)', row).html(reverseIndex);
            }
        });

        beneficiaryModal.show();
    })

    function loadBeneficiaries(data, callback) {
        const customerIdString = $("#customerIdString").val() || $("#customerIdString").text();
        $.ajax({
            url: `/beneficiary/list`,
            method: "GET",
            data: {
                customerId: customerIdString,
                page: Math.floor(data.start / data.length),
                size: data.length
            },
            dataType: "json",
            success: function (response) {
                callback({
                    draw: data.draw,
                    recordsTotal: response.totalElements,
                    recordsFiltered: response.totalElements,
                    data: response.content
                });
            },
            error: function () {
                callback({
                    draw: data.draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            }
        })
    }

    /**
     * Resolved Beneficiary modal close error
     */
    const beneficiaryModalEl = document.getElementById('beneficiaryManagement');
    beneficiaryModalEl.addEventListener('hide.bs.modal', function () {
        $('#beneficiaryManagementTableOuter').show()
        $("#beneficiaryEditFormOuter").hide()
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });

    /**
     * Select Beneficiary
     */
    $('#beneficiaryManagementTable').off('click', 'tbody tr').on('click', 'tbody tr', function () {
        const rowData = beneficiaryManagementTable.row(this).data();
        console.log(rowData);
        if (!rowData.relation || rowData.relation == ""
            || !rowData.transactionReason || rowData.transactionReason == ""
            || !rowData.incomeSource || rowData.incomeSource == "") {
            alert("Please complete all transaction information for the beneficiary (Relation, Reason, and Source of Income).");
            showBeneficiaryEditForm(rowData)
            return;
        }
        if (rowData) {
            $("#receiverFieldset").show();
            $("#beneficiaryId").val(rowData.id);
            $("#beneficiaryName").val(`${rowData.lastName} ${rowData.firstName} ${rowData.middleName}`);
            $("#beneficiaryRegistrationType").val(rowData.registrationType);
            $("#beneficiaryMobile").val(unescapeSpecialCharacters(rowData.mobile));
            $("#beneficiaryNationality").val(rowData.nationality);
            $("#beneficiaryGender").val(rowData.gender);
            $("#beneficiaryIdType").val(rowData.idType);
            $("#beneficiaryIdNumber").val(unescapeSpecialCharacters(rowData.idNumber));
            $("#beneficiaryAddress").val(unescapeSpecialCharacters(rowData.address));
            $("#beneficiaryPayoutPartner").val(rowData.payoutPartner);

            const beneficiaryPayoutType = [
                `Payout Type: ${rowData.payoutType.replace(/_/g, " ")}`,
            ];
            const bankName = `Payout Bank:  ${rowData.payoutBankName}`
            const branchName = `Payout Branch:  ${rowData.payoutBranchName || ""}`
            const accountNumber = `Account Number:  ${rowData.accountNumber || ""}`
            const isTranglo = rowData.payoutPartnerType === 'TRANGLO';
            if (rowData.payoutType === 'ACCOUNT_DEPOSIT') {
                beneficiaryPayoutType.push(bankName, branchName, accountNumber);
            } else if (rowData.payoutType === 'CASH_PAYMENT') {
                if (isTranglo) {
                    beneficiaryPayoutType.push(bankName, branchName);
                } else {
                    beneficiaryPayoutType.push(branchName);
                }
            } else if (rowData.payoutType === 'E_WALLET') {
                if (isTranglo) {
                    beneficiaryPayoutType.push(bankName, accountNumber);
                }
            }
            $("#beneficiaryPayoutInfo").val(beneficiaryPayoutType.join(" | ").replaceAll("null", "-"));

            $("#beneficiaryRelation").val(unescapeSpecialCharacters(rowData.relationName));
            $("#beneficiaryTransactionReason").val(unescapeSpecialCharacters(rowData.transactionReasonName));
            $("#beneficiaryIncomeSource").val(unescapeSpecialCharacters(rowData.incomeSourceName));

            if (pathname.includes("transaction")) {
                $("#remittanceFieldset").show();
                $("#allowButton").show();
                $("#paymentType").val(rowData.payoutType);
                $("#payoutPartnerId").val(rowData.payoutPartnerId);
                $("#bank").val(rowData.payoutBankCode);
                $("#bankId").val(rowData.payoutBankId);
                $("#bankName").val(unescapeSpecialCharacters(rowData.payoutBankName));
                $("#accountNo").val(rowData.accountNumber);
                $("#branch").val(rowData.payoutBranchCode);
                $("#branchName").val(unescapeSpecialCharacters(rowData.payoutBranchName));
            }

            bootstrap.Modal.getInstance(document.getElementById('beneficiaryManagement')).hide();
            const modal = bootstrap.Modal.getInstance(document.getElementById('beneficiaryManagement'));
            modal.hide();
        }
    });

    /**
     * Edit Page Load Beneficiary
     */
    let beneficiaryId;
    $('#beneficiaryManagementTable').off('click', 'tbody tr #beneficiaryEditButton').on('click', 'tbody tr #beneficiaryEditButton', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const rowData = beneficiaryManagementTable.row($(this).closest('tr')).data();
        if (!rowData) return;

        showBeneficiaryEditForm(rowData)
    });

    function showBeneficiaryEditForm(rowData) {
        const partnersCountry = findCountryById(JSON.parse(sessionStorage.getItem("partnersCountry")), rowData.payoutPartnerId);

        $('#beneficiaryManagementTableOuter').hide()
        $("#beneficiaryEditFormOuter").show()
        $("#beneficiaryEditSubmitButton").show()
        $("#beneficiarySaveSubmitButton").hide()
        $("#modalTitle").text(`Edit Beneficiary ${rowData.lastName} ${rowData.firstName} ${rowData.middleName}`)

        beneficiaryId = rowData.id;
        const $form = $("#beneficiaryEditForm");
        $form.find("#lastName").val(rowData.lastName);
        $form.find("#middleName").val(rowData.middleName);
        $form.find("#firstName").val(rowData.firstName);

        $form.find(`input[name="registrationType"][value="${rowData.registrationType}"]`).prop("checked", true);
        $form.find(`input[name="gender"][value="${rowData.gender}"]`).prop("checked", true);

        $form.find("#mobile").val(rowData.mobile);
        $form.find("#idType").val(rowData.idType);
        $form.find("#idNumber").val(rowData.idNumber);
        $form.find("#nationality").val(rowData.nationalityId).trigger("change");
        $form.find("#nationalitySelect").val(rowData.nationalityId).trigger("change");
        $form.find("#address").val(rowData.address);

        $form.find("#partnerNationality").val(partnersCountry).trigger("change");
        $form.find("#payoutTypeInput").val(rowData.payoutType);
        $form.find("#payoutBankInput").val(rowData.payoutBankId);
        $form.find("#payoutBranchInput").val(rowData.payoutBranchId);
        $form.find("#accountNumber").val(rowData.accountNumber);
        $form.find("#payoutPartner").val(rowData.payoutPartnerId).trigger("change");

        $form.find("#relation").val(rowData.relation);
        $form.find("#transactionReason").val(rowData.transactionReason);
        $form.find("#incomeSource").val(rowData.incomeSource);
    }

    function findCountryById(data, id) {
        for (const [country, partners] of Object.entries(data)) {
            if (partners.some(p => p.id  === Number(id))) {
                return country;
            }
        }
        return null;
    }

    /**
     * Delete Beneficiary
     */
    $('#beneficiaryManagementTable').off('click', 'tbody tr #beneficiaryDeleteButton').on('click', 'tbody tr #beneficiaryDeleteButton', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const rowData = beneficiaryManagementTable.row($(this).closest('tr')).data();

        if (!confirm("Are you sure you want to delete this beneficiary?")) {
            return
        }

        $.ajax({
            url: `/beneficiary/delete?id=${rowData.id}`,
            method: "DELETE",
            success: function () {
                if (confirm("Beneficiary Deleted Success")) {
                    beneficiaryManagementTable.ajax.reload();
                }
            },
            error: function (error) {
                console.log(error);
                alert(error.responseText);
            }
        })
    });


    /**
     * New Beneficiary Page Load
     */
    $('#beneficiaryAddButton').on('click', function () {
        $('#beneficiaryManagementTableOuter').hide()
        $("#beneficiaryEditFormOuter").show()
        $("#beneficiaryEditSubmitButton").hide()
        $("#beneficiarySaveSubmitButton").show()
        $("#beneficiaryEditForm")[0].reset();
    });

    /**
     * Submit Beneficiary
     */
    $('#beneficiarySaveSubmitButton').on('click', function () {
        if (!validatePayoutType()) {
            return;
        }
        saveBeneficiary();
    });

    $('#beneficiaryEditSubmitButton').on('click', function () {
        if (!validatePayoutType()) {
            return;
        }
        editBeneficiary();
    });

    // 기본 필수 입력값
    const requiredFields = [
        'firstName', 'lastName',
        'mobile', 'address',
        'partnerNationality', 'payoutPartner', 'payoutType',
        'relation', 'transactionReason', 'incomeSource',
    ]
    function checkEmptyFields(obj, keysToCheck) {
        const empty = keysToCheck.filter(key => obj[key] === "");
        return empty.length <= 0;
    }
    // Payout Type별 필수 입력값
    function validatePayoutType() {
        const payoutType = $("#payoutType").val();

        // payout 필수 입력값 대상
        const payoutBank = $("#payoutBank").val();
        const payoutBranch = $("#payoutBranch").val();
        const accountNumber = $("#accountNumber").val();
        const idType = $("#idType").val();
        const idNumber = $("#idNumber").val();

        // partnerType 확인
        const partnerType = $("#payoutPartner option:selected").data('type');

        if (payoutType === 'ACCOUNT_DEPOSIT') {
            if (!payoutBank || !payoutBranch || !accountNumber) {
                alert("For Account Deposit, Bank / Branch / Account Number is required. Please enter or select all required fields.");
                return false;
            }
        } else if (payoutType === 'CASH_PAYMENT') {
            if (!payoutBranch) {
                alert("For Cash Payment, Branch is required. Please select a Branch.");
                return false;
            }

            if (!idType && !idNumber) {
                alert("For Cash Payment, both ID Type and ID Number are required. Please select an ID Type and enter your ID Number.");
                return false;
            } else if (!idType) {
                alert("For Cash Payment, ID Type is required. Please select an ID Type.");
                return false;
            } else if (!idNumber) {
                alert("For Cash Payment, ID Number is required. Please enter your ID Number.");
                return false;
            }

            if (partnerType === 'TRANGLO') {
                if (!payoutBank) {
                    alert("For Tranglo Cash Payment, Bank is required. Please select a Bank.");
                    return false;
                }
            }
        } else if (payoutType === 'E_WALLET') {
            if (partnerType === 'TRANGLO') {
                if (!payoutBank || !accountNumber) {
                    alert("For Tranglo E-Wallet, Bank / Account Number is required. Please enter or select all required fields.");
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Save Beneficiary
     */
    function saveBeneficiary() {
        const $form = $("#beneficiaryEditForm");
        const formData = Object.fromEntries(new FormData($form[0]));
        formData.customerId = $("#customerIdString").val() || $("#customerIdString").text();

        if (!checkEmptyFields(formData, requiredFields)) {
            alert(`Please enter or select all required fields.`);
        } else {
            $.ajax({
                url: '/beneficiary/create',
                method: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json",
                success: function (response) {
                    if (confirm("Beneficiary Created Success")) {
                        $('#beneficiaryManagementTableOuter').show();
                        $("#beneficiaryEditFormOuter").hide();
                        beneficiaryManagementTable.ajax.reload();
                    }
                },
                error: function (error) {
                    console.log(error);
                    alert(error.responseText || JSON.parse(error.responseText).message);
                }
            })
        }
    }

    /**
     * Edit Beneficiary
     */
    function editBeneficiary() {
        const $form = $("#beneficiaryEditForm");
        const formData = Object.fromEntries(new FormData($form[0]));

        if (!checkEmptyFields(formData, requiredFields)) {
            alert(`Please enter or select all required fields.`);
        } else {
            $.ajax({
                url: `/beneficiary/update?id=${beneficiaryId}`,
                method: "PUT",
                data: JSON.stringify(formData),
                contentType: "application/json",
                success: function () {
                    if (confirm("Beneficiary Update Success")) {
                        $('#beneficiaryManagementTableOuter').show();
                        $("#beneficiaryEditFormOuter").hide();
                        beneficiaryManagementTable.ajax.reload();
                    }
                },
                error: function (error) {
                    console.log(error);
                    alert(error.responseText || JSON.parse(error.responseText).message);
                }
            })
        }
    }


    /**
     * Cancel Beneficiary
     */
    $('#beneficiaryCancelButton').on('click', function () {
        $('#beneficiaryManagementTableOuter').show()
        $("#beneficiaryEditFormOuter").hide()
    });

    $("#nationalitySelect").on("change", function () {
        $("#nationality").val($(this).val());
    })

    /**
     * **파트너 목록 불러오기**
     * 1. 국가 선택 후 해당 국가의 파트너 목록 표시
     * 2. 서버에서 "Payout Partner" 데이터를 요청하고 드롭다운에서 표시.
     */
    const $payoutPartner = $("#payoutPartner");
    const $payoutType = $("#payoutType");
    const $payoutBank = $("#payoutBank");
    const $payoutBranch = $("#payoutBranch");
    const $payoutBranchRequiredMark = $(".payout-branch-required-mark");
    const $accountNumber = $("#accountNumber");

    $("#partnerNationality").on("change", function() {
        const payoutPartners = JSON.parse(sessionStorage.getItem("partnersCountry"));
        let selectedPayoutPartner = payoutPartners[this.value];

        const selectedId = $payoutPartner.val()
        if (selectedId != null) {
            getPayoutType(selectedId)
        }

        let options = "<option value=''>Select Payout Partner</option>";
        const isOnlyOnePartner = selectedPayoutPartner.length == 1;
        selectedPayoutPartner.forEach((item) => {
            options += `<option ${selectedId == item.id || isOnlyOnePartner ? 'selected' : ''} value="${item.id}" data-type="${item.type}">${item.name}</option>`;
        });
        $payoutPartner.html(options).trigger("change");
    })

    /**
     * **파트너 변경 이벤트**
     * 사용자가 파트너를 변경할 때 실행. 해당 파트너의 정보 데이터를 로드.
     */
    const defaultBranchOption = '<option value="">Select Payout Branch</option>';
    $payoutPartner.on("change", function() {
        const payoutPartnerValue = $(this).val();

        $payoutPartner.val(payoutPartnerValue)
        $payoutBranch.attr("required");
        $payoutBranch.html(defaultBranchOption);
        $payoutBranch.prop("disabled", false);
        $payoutBranchRequiredMark.show();

        if (payoutPartnerValue) {
            getPayoutType(payoutPartnerValue, $("#payoutTypeInput").val(), $("#payoutBankInput").val(), $("#payoutBranchInput").val())
        }

        const partnerType = $("#payoutPartner option:selected").data('type');
        const purposeOfRemittances = JSON.parse(sessionStorage.getItem("purposeOfRemittances"));
        const relationToBeneficiaries = JSON.parse(sessionStorage.getItem("relationToBeneficiaries"));
        const sourceOfIncomes = JSON.parse(sessionStorage.getItem("sourceOfIncomes"));
        setBasicTransactionInformation(partnerType, purposeOfRemittances, relationToBeneficiaries, sourceOfIncomes);
        isRequired(partnerType);

        const $gmeReasons = $("#gmeReasons")
        $gmeReasons.removeAttr("required");
    })

    let payoutPartnerInfoList = [];
    function getPayoutType(payoutPartner, selectedType, selectedBank, selectedBranch) {
        const payoutTypeValue = $payoutType.val()

        let typeOptions= "<option value=''>Select Payout Type</option>";
        $.ajax({
            url: `/transaction/transactionOutboundHistorySend/${payoutPartner}`,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                payoutPartnerInfoList = response;
                if (payoutTypeValue) {
                    getBank(payoutTypeValue)
                }
                response.forEach(item => {
                    typeOptions += `<option ${payoutTypeValue === item.payoutType ? 'selected' : ''} value="${item.payoutType}">${item.payoutType}</option>`;
                });
                $payoutType.html(typeOptions);

                if (selectedType) {
                    $payoutType.val(selectedType).trigger("change");
                    getBank(selectedType, selectedBank, selectedBranch);
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr, status, error);
            }
        });
    }

    /**
     * **파트너 타입 변경 이벤트**
     * 사용자가 파트너타입을 변경할 때 실행. 해당 파트너 타입의 정보 데이터를 로드.
     */
    $payoutType.on("change", function() {
        const payoutTypeValue = $(this).val();

        // 1. 전체 초기화
        resetRequired();

        // 2. 송금 타입에 따라 화면 구분
        if (payoutTypeValue) {
            const isTranglo = $("#payoutPartner option:selected").data('type') === 'TRANGLO';

            if ($(this).val() === 'ACCOUNT_DEPOSIT') {
                $(".payout-bank-outer").show();
                $(".payout-branch-outer").show();
                $(".register-account-outer").show();

                $payoutBank.attr("required", true);
                $payoutBranch.attr("required", true);
                $accountNumber.attr("required", true);
            } else if ($(this).val() === 'CASH_PAYMENT') {
                /**
                 * Tranglo 예외 처리
                 * CASH_PAYMENT: bank 필수
                 */
                if (isTranglo) {
                    $(".payout-bank-outer").show();
                    $payoutBank.attr("required", true);
                }
                $(".payout-branch-outer").show();
                !isTranglo ? $(".payout-branch-outer label").attr("style", "padding-left: 0px !important;") : null;
                $payoutBranch.attr("required", true);

                getBranch(payoutTypeValue);
            } else if ($(this).val() === 'E_WALLET') {
                $(".payout-bank-outer").show();
                $(".register-account-outer").show();

                $payoutBank.attr("required", true);
                $accountNumber.attr("required", true);
            }
            getBank(payoutTypeValue);
        }
    })
    const resetRequired = () => {
        $(".payout-bank-outer").hide();
        $(".payout-branch-outer").hide();
        $(".register-account-outer").hide();
        $(".payout-branch-outer label").removeAttr("style");

        $payoutBank.removeAttr("required");
        $payoutBranch.removeAttr("required");
        $accountNumber.removeAttr("required");
    }

    let bankList = []
    function getBank(payoutType, selectedBank, selectedBranch) {
        let payoutBankValue = selectedBank || $payoutBank.val();
        let bankOptions= '<option value="">Select Payout Bank</option>'

        payoutPartnerInfoList.forEach(item => {
            if (item.payoutType == payoutType) {
                bankList = item.banks;
            }
        })
        bankList.forEach(bank => {
            bankOptions += `<option ${payoutBankValue === bank.bankId ? 'selected' : ''} value="${bank.bankId}">${bank.bankName}</option>`
        })

        $payoutBank.html(bankOptions);

        if (selectedBank) {
            $payoutBank.val(payoutBankValue).trigger("change");
            getBranch(payoutType, payoutBankValue, selectedBranch);
        }
    }

    /**
     * **은행 변경 이벤트**
     * 사용자가 은행 (`payoutBank`)을 변경했을 때 실행되는 이벤트 핸들러.
     */
    $payoutBank.on("change", function() {
        const payoutTypeValue = $payoutType.val();
        const payoutBank = $(this).val();
        getBranch(payoutTypeValue, payoutBank)
    })

    function getBranch(payoutTypeValue, payoutBank, selectedBranch) {
        let payoutBranchValue = selectedBranch || $payoutBranch.val();
        let branchOptions= defaultBranchOption

        let branchList = []
        if (payoutTypeValue == 'CASH_PAYMENT') {
            payoutPartnerInfoList.forEach(item => {
                if (item.payoutType == payoutTypeValue) {
                    branchList = item.banks[0].branches
                }
            })
        } else {
            bankList.forEach(item => {
                if (item.bankId == payoutBank) {
                    branchList = item.branches
                }
            })
        }

        if (branchList.length == 0) {
            branchOptions = `<option value="" selected>No Branches found</option>`
            $payoutBranch.html(branchOptions);
            $payoutBranch.removeAttr("required");
            $payoutBranchRequiredMark.hide();
        } else {
            branchList.forEach(branch => {
                branchOptions += `<option ${payoutBranchValue === branch.branchId ? 'selected' : ''} value="${branch.branchId}">${branch.branchName}</option>`
            })
        }
        $payoutBranch.html(branchOptions);
        if (payoutBranchValue) {
            $payoutBranch.val(payoutBranchValue);
        }
    }

    // 조건부 파라미터 필수 값으로 지정
    const isRequired = (partnerType) => {
        const $beneficiaryIdTypeLabel = $(`label[for="idType"]`);
        const $beneficiaryIdTypeRequiredMark = $beneficiaryIdTypeLabel.find('.text-danger');
        if (partnerType === 'TRANGLO') {
            if ($beneficiaryIdTypeRequiredMark.length === 0) {
                $beneficiaryIdTypeLabel.append('<span class="text-danger">*</span>');
            }
            $("#idType").attr('required', 'required');
            $("#idNumber").attr('required', 'required');
        } else {
            $beneficiaryIdTypeRequiredMark.remove();
            $("#idType").removeAttr('required');
            $("#idNumber").removeAttr('required');
        }
    }
})