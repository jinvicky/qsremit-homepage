const getBankAndReason = async (reasonMap) => {
    $.ajax({
        url: `/pgManagement/api/bankcode`,
        type: "GET",
        success: function (response) {
            const bankSelect = $("#bankNameSelectSearch");
            bankSelect.empty();

            bankSelect.append($('<option>', {
                value: '',
                text: 'All'
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
            const reasonSelectSearch = $("#reasonSelectSearch");
            reasonSelect.empty();
            reasonSelectSearch.empty();

            reasonSelect.append($('<option>', {
                value: '',
                text: 'Select'
            }));
            reasonSelectSearch.append($('<option>', {
                value: '',
                text: 'All'
            }));

            response.forEach(function (item) {
                const selected = $("#reasonInput").val() === item.code;
                reasonSelect.append($('<option>', {
                    value: item.code,
                    text: item.reason,
                    selected: selected
                }));
                reasonSelectSearch.append($('<option>', {
                    value: item.code,
                    text: item.reason,
                }));
                reasonMap[item.code] = item.reason;
            });
        },
        error: function (xhr, status, error) {
            console.error("Error loading options:", error);
        }
    });
}