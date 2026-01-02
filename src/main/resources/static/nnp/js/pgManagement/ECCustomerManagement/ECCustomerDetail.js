
$(document).ready(async function() {
    let isLoad = false;
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    if (!customerId) {
        if (window.confirm("Are you sure to update this customer?")) {
            window.location.href = '/pgManagement/ECCustomerManagement';
        }
        return
    }

    function handleSelectValueByTab(selectId, inputId) {
        if (isLoad) {
            $(selectId).change(function () {
                $(inputId).val($(selectId).val());
            })
        }
    }
    handleSelectValueByTab("#bankName", "#bankNameInput");
    handleSelectValueByTab("#reasonSelect", "#reasonInput");

    // ajax 초기화
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    async function fetchData () {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/pgManagement/ECCustomerDetail/${customerId}`,
                method: "GET",
                contentType: "application/json",
                success: function (data) {
                    const type = data.ecType || 'B2C';
                    const status = data.ecStatus || 'ACTIVE';

                    $("#statusSelect option").each(function () {
                        if ($(this).val() === `${unescapeSpecialCharacters(status)}`) {
                            $(this).prop("selected", true);
                        }
                    })
                    $("#bankNameInput").val(unescapeSpecialCharacters(data.ecBankName));
                    $("#reasonInput").val(unescapeSpecialCharacters(data.ecReason));

                    $("#accountNo").val(unescapeSpecialCharacters(data.ecAccountNo));
                    $("#holderName").val(unescapeSpecialCharacters(data.ecHolderName));

                    if (type && ['B2B', 'B2C', 'C2B'].includes(type)) {
                        $("input[name='gmeType'][value='" + type + "']").prop("checked", true);
                    }

                    $("#receiver").val(unescapeSpecialCharacters(data.ecReceiver));
                    $("#companyName").val(unescapeSpecialCharacters(data.ecCompanyName));
                    $("#address").val(unescapeSpecialCharacters(data.ecCompanyAddress));
                    resolve(data);
                },
                error: function (err) {
                    console.log("Error");
                    reject(err);
                }
            })
        })
    }

    async function getBankCodeData() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/pgManagement/api/bankcode`,
                type: "GET",
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
                    resolve(response);
                },
                error: function (xhr, status, error) {
                    console.error("Error loading options:", error);
                    reject(err);
                }
            })
        })
    }
    async function getReasonData() {
        return new Promise((resolve, reject) => {
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
                    resolve(response);
                },
                error: function (xhr, status, error) {
                    console.error("Error loading options:", error);
                    reject(err);
                }
            })
        })
    }

    await fetchData()
    await getBankCodeData();
    await getReasonData();

    $("form").on("submit", function(e) {
        e.preventDefault();

        const updateData = {
            ecBankName: $("#bankName").val() || $("#bankNameInput").val(),
            ecAccountNo: $("#accountNo").val(),
            ecHolderName: $("#holderName").val(),
            ecType: $("input[name='gmeType']:checked").val(),
            ecSenderType: "COMPANY",  // 기본값
            ecReason: $("#reasonSelect").val() || $("#reasonInput").val(),
            ecReceiver: $("#receiver").val(),
            ecReceiverType: "COMPANY",  // 기본값
            ecCompanyName: $("#companyName").val(),
            ecCompanyAddress: $("#address").val(),
            ecStatus: $("#statusSelect").val()
        };

        $.ajax({
            url: `/pgManagement/ECCustomerDetail/update/${customerId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updateData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader(header, token);
            },
            success: function (res){
                if (res) window.location.href = "/pgManagement/ECCustomerManagement";
            },
            error: function (xhr, status, error) {
                console.log("Error Message:", error);
            }
        });
    });
    isLoad = true;
})