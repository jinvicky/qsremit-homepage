$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    function handleSelectValueByTab(selectId, inputId) {
        $(selectId).change(function () {
            $(inputId).val($(selectId).val());
        })
    }
    handleSelectValueByTab("#bankName", "#bankNameInput");
    handleSelectValueByTab("#reasonSelect", "#reasonInput");

    function getAjaxData() {
        $.ajax({
            url: `/pgManagement/api/bankcode`,
            type: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function (response) {
                const bankSelect = $("#bankName");
                bankSelect.empty();

                bankSelect.append($('<option>', {
                    value: '',
                    text: 'Select'
                }));

                response.forEach(function (item) {
                    const selected = $("#bankNameInput").val() === item.bankName;
                    bankSelect.append($('<option>', {
                        value: item.bankName,
                        text: item.bankName,
                        selected: selected
                    }));
                });
            },
            error: function (xhr, status, error) {
                console.error("Error loading options:", error);
            }
        });

        $.ajax({
            url: `/pgManagement/api/reason`,
            type: "GET",
            success: function (response) {
                const reasonSelect = $("#reasonSelect");
                reasonSelect.empty();

                reasonSelect.append($('<option>', {
                    value: '',
                    text: 'Select'
                }));

                response.forEach(function (item) {
                    const selected = $("#reasonInput").val() === item.code;
                    reasonSelect.append($('<option>', {
                        value: item.code,
                        text: item.reason,
                        selected: selected
                    }));
                });
            },
            error: function (xhr, status, error) {
                console.error("Error loading options:", error);
            }
        });
    }
    getAjaxData();

    // New Customer Submit
    $("form").on("submit", function (e) {
        e.preventDefault();

        const formData = {
            ecBankName: $('#bankName').val() || $("#bankNameInput").val(),
            ecAccountNo: $('input[name="accountNo"]').val(),
            ecHolderName: $('input[name="holderName"]').val(),
            ecType: $('input[name="gmeType"]:checked').val(),
            ecSenderType: "COMPANY",  // 기본값
            ecReason: $('#reasonSelect').val() || $("#reasonInput").val(),
            ecReceiver: $('input[name="receiver"]').val(),
            ecReceiverType: "COMPANY",  // 기본값
            ecCompanyName: $('input[name="companyName"]').val(),
            ecCompanyAddress: $('input[name="address"]').val()
        };

        $.ajax({
            url: "/pgManagement/newECCustomerManagement/create",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function (res){
                if (res) window.location.href = "/pgManagement/ECCustomerManagement";
            },
            error: function () {
                alert("Error of ajax. Failed to create EC customer. Please try again.");
            }
        });
    });
})
