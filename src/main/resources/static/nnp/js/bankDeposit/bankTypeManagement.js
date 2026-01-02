$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    const bankTypeEditor =  new DataTable.Editor({
        table: "#bankTypeTable",
        idSrc: "id",
        fields: [
            { label: "Order", name: "orderNo",
                attr: {
                    placeholder: "Input Number",
                }
            },
        ],
        ajax: {
            edit: {
                type: "PUT",
                url: `/bankDeposit/bankTypeManagement/update/{id}`,
                data: function (data) {
                    const id = Object.keys(data.data)[0];
                    const originalData = bankTypeTable
                        .rows()
                        .data()
                        .toArray()
                        .find((row) => row.id === id);

                    const editedData = data.data[id];

                    const fullUpdateData = { ...originalData, ...editedData };

                    if (fullUpdateData.orderNo !== null && isNaN(fullUpdateData.orderNo)) {
                        throw new Error('Invalid data: orderNo must be a valid number.');
                    }

                    return JSON.stringify({orderNo: fullUpdateData.orderNo});
                },
                success: function (response) {
                    alert(response.message);
                    bankTypeTable.ajax.reload();
                },
                error: function (xhr) {
                    if (xhr.responseJSON) {
                        alert(xhr.responseJSON.message);
                    } else {
                        alert("An error occurred while processing your request.");
                    }
                }
            },
        }
    })

    bankTypeEditor.on('preSubmit', function (e, o, action) {
        if (action !== 'remove') {
            let orderNo = this.field('orderNo');

            if (isNaN(orderNo.val())) {
                orderNo.error("Order number must be a number");
            }

            if (this.inError()) {
                return false;
            }
        }
    });

    const bankTypeTable = $("#bankTypeTable").DataTable({
        ajax: {
            url: "/bankDeposit/bankTypeManagement/",
            dataSrc: "",
        },
        columns: [
            { data: null, title: "No.", width: "3%" }, // 0
            { data: "orderNo", title: "Order", width: "10%"}, // 1
            { data: 'bank', title: "Bank", width: "20%",
                render: function (data, type, row) {
                    if (row.isNullable) {
                        return data + " (Empty Type)";
                    } else {
                        return data
                    }
                },
            }, // 2
            { data: "accountName", title: "Account Name or Number", width: "30%"},
            { data: 'updatedAt', visible: false }, // 4
        ],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        columnDefs: [
            { targets: [0], className: "dt-head-center dt-body-center" }
        ],
        pageLength: 50,
        sorting: false,
        searching: false,
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');
        },
        rowCallback: function(row, data, index) {
            const pageInfo = this.api().page.info();
            const normalIndex = (pageInfo.page * pageInfo.length) + index + 1;
            $('td:eq(0)', row).html(normalIndex);
        },
        createdRow: function (row) {
            const targetColumns = [1];

            targetColumns.forEach((columnIndex) => {
                $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
            });
        }
    });

    bankTypeTable.on('click', 'tbody td', function () {
        try {
            bankTypeEditor.inline(this);
        } catch (error) {
            console.error(error);
        }
    });
    clickRemoveButton(bankTypeTable, bankTypeEditor)

    bankTypeTable.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        bankTypeTable.page.len(pageLength);
    }, 0);
});