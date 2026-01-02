$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    const userInfo = JSON.parse(Cookies.get("user"));

    $("#customerRegistrationDate").text(moment().format('YYYY-MM-DD'));
    $("#customerRegistrationAdmin").text(`[${userInfo.userType}] ${userInfo.name}`);
    $(".show-customer-detail").hide();

    // Registration Type Change
    $("input[name='customerRegistrationType']").on("click", function () {
        const url = new URL(window.location);
        url.searchParams.set('type', $(this).val());
        window.location.href = url;
    })

    let remittancePrivacyId;
    let confirmPEPsId;
    $.ajax({
        url: "/customer/getTermsForSignup",
        method: "GET",
        success: function (response) {
            const REMITTANCE_PRIVACY = response.find(item => item.type == "REMITTANCE_PRIVACY");
            const CONFIRM_PEPS = response.find(item => item.type == "CONFIRM_PEPS");
            remittancePrivacyId = REMITTANCE_PRIVACY.id;
            confirmPEPsId = CONFIRM_PEPS.id;

            $("#remittancePrivacyContent").html(REMITTANCE_PRIVACY.content);
            $("#confirmPEPsContent").html(CONFIRM_PEPS.content);
        },
        error: function () {
            alert("Failed to read terms. Please try again.");
        }
    });

    // ID Card Form
    checkIdCardVal()
    $("#customerIdCardtype").on("change", function() {
        checkIdCardVal()
    })

    function checkIdCardVal() {
        if ($("#customerIdCardtype").val()) {
            $("#idCardForm").show()
        }
        if ($("#customerIdCardtype").val() === "RESIDENCE_CARD") {
            $("#idCardIssuerInput").hide()
            $("#idCardNationalityInput").show()
            $("#idCardIssueDateInput").show()
        } else {
            $("#idCardIssuerInput").show()
            $("#idCardNationalityInput").hide()
            $("#idCardIssueDateInput").hide()
        }
    }

    $("#beneficiaryLastName, #beneficiaryFirstName").on("change", function(e) {
        checkBeneficiaryValue()
    });
    function checkBeneficiaryValue() {
        const lastName = $("#beneficiaryLastName").val();
        const firstName = $("#beneficiaryFirstName").val();

        if (lastName !== '' || firstName !== '') {
            $("#beneficiaryAddFieldset input, #beneficiaryAddFieldset select").each(function () {
                $(this).prop('required', true);
            });
            $("#beneficiaryMiddleName").removeAttr('required');
        }
    }

    initValidation()
    function initValidation() {
        $("#beneficiaryAddAccount input, #beneficiaryAddAccount select").each(function () {
            $(this).removeAttr('required');
        })
    }

    // 검색 input 활성화 시 Enter 검색 이벤트 활성화
    $("#customerZipcode").on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#searchZipcodeButton").trigger("click");
        }
    });
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#saveButton").trigger("click");
        }
    });
    // Search Zipcode
    $("#searchZipcodeButton").on("click", function () {
        const zipcode = $("#customerZipcode").val().trim();

        if (!zipcode.trim()) {
            alert("Please enter a search term.");
            return;
        }

        $.ajax({
            url: "/customer/searchZipcodeAll",
            method: "GET",
            data: {
                searchTerm: zipcode
            },
            success: function (response) {
                let resultHtml = "";

                if (response.length > 0) {
                    resultHtml += "<ul class='list-group'>";
                    response.forEach(function (item) {
                        resultHtml += "<li class='list-group-item' data-id='" + item.id + "'> (" + item.zipcode + ") Japan, " + item.state + " " + item.city + " " + item.street + "</li>";
                    });
                    resultHtml += "</ul>";
                } else {
                    resultHtml = "No search results.";
                }


                $("#searchResults").html(resultHtml);
            },
            error: function () {
                alert("Failed to search zipcode. Please try again.");
            }

        });
    });

    // Search Zipcode Click
    $(document).on("click", "#searchResults .list-group-item", function () {
        const id = $(this).data("id");

        $.ajax({
            url: "/customer/searchZipcode",
            method: "GET",
            data: {
                id: id
            },
            success: function (response) {
                if (response) {
                    $("input#customerZipcode").val(response.zipcode).change()
                    $("input#customerCity").val(response.city)
                    $("input#customerCityJp").val(response.cityJp)
                    $("select#customerState").val(response.state).change()
                    $("input#customerStreet").val(response.street)
                    $("input#customerStreetJp").val(response.streetJp)

                    $("#searchResults").html(" ")

                    $("input#customerZipcode").parsley().reset();
                    $("input#customerCity").parsley().reset();
                    $("input#customerCityJp").parsley().reset();
                    $("select#customerState").parsley().reset();
                    $("input#customerStreet").parsley().reset();
                    $("input#customerStreetJp").parsley().reset();
                }
            },
            error: function () {
                alert("Failed to search zipcode. Please try again.");
            }

        });
    });

    // New Customer Submit
    // 중복이 있지만 허용해야 하는지 여부를 판단
    let submitting = false;
    let allowIfDuplicateExists = false
    $('form[data-submit-once=\"true\"]').on("submit", function (e) {
        if (submitting) {
            e.preventDefault();
            return;
        }
        e.preventDefault();

        checkDuplicateOptional(function (isAllowed, duplicateFields) {
            if (isAllowed) {
                allowIfDuplicateExists = true;
            } else if (duplicateFields && confirm(`${duplicateFields} already exists. Do you want to continue?`)) {
                allowIfDuplicateExists = true;
            }

            const $submitButton = $(this).find('button[type="submit"]');

            if (allowIfDuplicateExists) {
                submitting = true;
                $submitButton.prop('disabled', true);

                $("#customerMobilePassword").val($("#newMobilePassword").val())
                $("#customerMobileRemitPin").val($("#newMobileRemitPin").val())
                if (typeof $("#payoutBank").val() === 'string') {
                    $("#payoutBank").val(null);
                }

                let formData = $("form").serialize();

                // 추가 파라미터 연결
                formData = formData +
                    "&remittancePrivacyId=" + encodeURIComponent(remittancePrivacyId) +
                    "&confirmPEPsId=" + encodeURIComponent(confirmPEPsId);

                $.ajax({
                    url: "/customer/newCustomer",
                    method: "POST",
                    data: formData,
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        $("#loadingSpinner").show();
                        xhr.setRequestHeader(header, token);
                    },
                    success: function (){
                        alert('Customer Successfully Registered.')
                        const tabs = JSON.parse(sessionStorage.getItem("tabs"))
                        const title = $(".page-title").text()
                        const withoutTab = tabs.filter(tab => tab.title !== title)
                        sessionStorage.setItem("tabs", JSON.stringify(withoutTab))
                        window.location.href = "/customer/customerSearch";
                    },
                    error: function (xhr) {
                        if (xhr.status === 409) {
                            alert("This customer information already exists. Please try again.");
                        } else if (xhr.status === 400) {
                            // IllegalArgumentException 메시지를 alert로 표시
                            alert(xhr.responseText);
                        } else {
                            alert(xhr.responseText || "Failed to create customer. Please try again.");
                        }
                        $submitButton.prop('disabled', false);
                    },
                    complete: function () {
                        $("#loadingSpinner").hide();
                        submitting = false;
                        $submitButton.prop('disabled', false);
                    }
                });
            }
        })
    })

    function checkDuplicateOptional(callback) {
        $.ajax({
            url: "/customer/checkDuplicate",
            method: "POST",
            data: {
                firstName: $("input[name='customerFirstName']").val().trim(),
                middleName: $("input[name='customerMiddleName']").val().trim(),
                lastName: $("input[name='customerLastName']").val().trim(),
                birth: String($("input[name='customerBirth']").val().trim())
            },
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr){
                $("#loadingSpinner").show();
                xhr.setRequestHeader(header, token);
            },
            success: function (response) {
                const duplicateFields = response.duplicateFields

                if (duplicateFields.length === 0) {
                    callback(true)
                } else {
                    callback(false, duplicateFields.join(', '))
                }
            },
            error: function () {
                alert("? Failed to create customer. Please try again.");
            },
            complete: function () {
                $("#loadingSpinner").hide();
            }
        });
    }
})
