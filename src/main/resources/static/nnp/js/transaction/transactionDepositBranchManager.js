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
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    const editor = new DataTable.Editor({
        ajax: {
            create: {
                type: "POST",
                url: "/transaction/transactionDepositBranchManager",
                data: function () {
                    return JSON.stringify({
                        branch: $("#DTE_Field_branch").val(),
                        branchCode: $("#DTE_Field_branchCode").val(),
                        availableState: $("#DTE_Field_availableStatelse_0").is(":checked")
                    });
                },
                success: function (response) {
                    alert(response.message);
                    table.ajax.reload();
                },
                error: function (xhr) {
                    alert("Failed to create data: " + xhr.responseText);
                }
            },
            edit: {
                type: "PUT",
                url: `/transaction/transactionDepositBranchManager/{id}`,
                data: function (data) {
                    const id = Object.keys(data.data)[0];
                    const originalData = table
                        .rows()
                        .data()
                        .toArray()
                        .find((row) => String(row.id) === id);

                    const editedData = data.data[id];
                    const fullUpdateData = {...originalData, ...editedData};

                    if (fullUpdateData.orderNo && isNaN(fullUpdateData.orderNo)) {
                        throw new Error('Invalid data: orderNo must be a valid number.');
                    }

                    return JSON.stringify({
                        orderNo: fullUpdateData.orderNo,
                        branch: fullUpdateData.branch,
                        branchCode: fullUpdateData.branchCode,
                        availableState: fullUpdateData.availableState === true || fullUpdateData.availableState === "true"
                    });
                },
                success: function (response) {
                    alert(response.message);
                    table.ajax.reload();
                },
                error: function (xhr) {
                    if (xhr.responseJSON) {
                        alert(xhr.responseJSON.message);
                    } else {
                        alert("An error occurred while processing your request.");
                    }
                }
            },
        },
        fields: [
            {
                label: 'Order',
                name: "orderNo",
            },
            {
                label: 'Branch <span class="text-danger">*</span>',
                name: "branch",
            },
            {
                label: "Branch Code <span class=\"text-danger\">*</span>",
                name: "branchCode"
            },
        ],
        idSrc: "id",
        table: "#data-table"
    });

    const table = new DataTable("#data-table", {
        ajax: {
            url: '/transaction/transactionDepositBranchManager/data',
            dataSrc: ''
        },
        searching: false,
        idSrc: "id",
        rowId: "id",
        order: [2, 'asc'],
        lengthMenu: [
            [50, 100, -1],
            [50, 100, 'All']
        ],
        columns: [
            { data: null, orderable: false, render: DataTable.render.select() },
            {
                data: null,
                title: "No.",
                width: "5%"
            },
            {
                data: "orderNo",
                title: "Order",
                width: "10%"
            },
            {
                data: "branch",
                title: "Deposit Branch"
            },
            {
                data: "branchCode",
                title: "Branch Code",
                render: function(data) {
                    return data.toString();
                }
            },
            {
                data: "availableState",
                title: "Available State",
                width: "12%",
                render: function (data, type, row) {
                    const isChecked = data === true || data === "true";
                    return `
            <div class="form-check form-switch d-flex justify-content-center">
                <input 
                    class="form-check-input api-status-toggle" 
                    type="checkbox" 
                    id="switch-${row.id}" 
                    data-partner-id="${row.id}" 
                    ${isChecked ? "checked" : ""}
                />
            </div>
        `;
                }
            },
            {data: "id", visible: false}
        ],
        columnDefs: [
            { targets: [0, 1, 2, 5], className: "dt-head-center dt-body-center" },
            { targets: 4, className: "dt-head-left dt-body-left" }
        ],
        layout: {
            topEnd: {
                buttons: [
                    {
                        text: 'Delete',
                        action: function () {
                            deleteData();
                        },
                        className: 'btn btn-danger'
                    },
                    {
                        extend: "create",
                        editor: editor,
                        className: 'btn btn-outline-primary width-l',
                        text: "New Branch",
                        action: function () {
                            editor.create({
                                title: "Create New",
                                buttons: {
                                    label: "Save",
                                    fn: function () {
                                        const branch = $("#DTE_Field_branch").val();
                                        const branchCode = $("#DTE_Field_branchCode").val();

                                        if (!branch || branch.trim() === "") {
                                            alert("Branch name is required.");
                                            return;
                                        }

                                        if (!branchCode || branchCode.trim() === "") {
                                            alert("branchCode is required.");
                                            return;
                                        }

                                        this.submit();
                                    }
                                }
                            });
                        }
                    },
                ]
            }
        },
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        rowCallback: function (row, data, index) {
            const pageInfo = this.api().page.info();
            const normalIndex = (pageInfo.page * pageInfo.length) + index + 1;
            $('td:eq(1)', row).html(normalIndex);
        },
        initComplete: function () {
            $('.dt-button').removeClass('dt-button');
        },
        createdRow: function (row) {
            const targetColumns = [2, 3, 4];

            targetColumns.forEach((columnIndex) => {
                $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
            });
        }
    });

    table.on('click', 'tbody td', function () {
        try {
            editor.inline(this);
        } catch (error) {
            console.error(error);
        }
    });

    table.on('change', '.api-status-toggle', function () {
        const checkbox = $(this);
        const partnerId = checkbox.data('partner-id');
        const newState = checkbox.prop('checked');

        const rowData = table.rows().data().toArray().find(row => row.id === partnerId);

        const payload = {
            orderNo: rowData.orderNo,
            branch: rowData.branch,
            branchCode: rowData.branchCode,
            availableState: newState
        };
        
        $.ajax({
            url: `/transaction/transactionDepositBranchManager/${partnerId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function () {
                table.ajax.reload();
            },
            error: function (xhr) {
                if (xhr.responseJSON) {
                    alert(xhr.responseJSON.message);
                } else {
                    alert("An error occurred while processing your request.");
                }

                checkbox.prop('checked', !newState);
            }
        });
    });

    function deleteData() {
        const selectedIds = table.rows({ selected: true }).data().toArray().map(row => row.id);

        if (selectedIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: `/transaction/transactionDepositBranchManager`,
            contentType: 'application/json',
            data: JSON.stringify({
                ids: selectedIds
            }),
            success: function () {
                alert("Deposit Branch delete successfully.")
                table.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.error("Error Message:", error);
                alert("Error occurred while deleting data. Please try again.");
            }
        });
    }

    table.on('length.dt', function(e, settings, len) {
        $("#tablePageInput").val(len);
    });

    setTimeout(() => {
        const pageLength = $("#tablePageInput").val() || 50;
        table.page.len(pageLength);
    }, 0);
});