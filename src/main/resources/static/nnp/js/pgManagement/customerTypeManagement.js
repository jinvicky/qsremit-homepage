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

    $.ajax({
        url: '/pgManagement/customerTypeManagement/ecCustomers',
        method: 'GET',
        success: function(response) {
            const options = [
                {
                    value: null,
                    label: 'Select'
                },
                ...response.map(customer => ({
                    value: customer.id,
                    label: customer.receiver
                }))
            ];

            initializeEditor(options);
        },
        error: function(xhr, status, error) {
            console.error('EC Customer 목록을 불러오는데 실패했습니다:', error);
        }
    });

    /**
     * Edit Table
     * @param options
     */

    const initializeEditor = (options) => {
        const customerTypeEditor =  new DataTable.Editor({
            table: "#customerTypeTable",
            idSrc: "id",
            fields: [
                { label: "Order", name: "orderNo",
                    attr: {
                        placeholder: "Input Number",
                    }
                },
                { label: "Receipt ID", name: "receiptNo",
                    attr: {
                        placeholder: "Input Number",
                    }},
                { label: "Customer Type <span style=\"color: red;\">*</span>", name: "customerType",
                    setFormatter: function (val) {
                        if (!val) return '';
                        return unescapeSpecialCharacters(val);
                    }
                },
                { label: "Email", name: "customerEmail",
                    setFormatter: function (val) {
                        if (!val) return '';
                        return val.split('&#44;').map(item => item.trim()).join(', ');
                    },
                    type: "textarea",
                },
                { label: "Company Name", name: "customerName",
                    setFormatter: function (val) {
                        if (!val) return '';
                        return unescapeSpecialCharacters(val);
                    }
                },
                {
                    label: "Receiver",
                    name: "ecCustomer",
                    type: "select",
                    options: options,
                    setFormatter: function (val) {
                        return val !== null ? val.id : '';
                    }
                }
            ],
            ajax: {
                create: {
                    type: "POST",
                    url: "/pgManagement/customerTypeManagement/create",
                    data: function (data) {
                        const formData = data.data[0];

                        return JSON.stringify({
                            orderNo: parseInt(formData.orderNo),
                            receiptNo: parseInt(formData.receiptNo),
                            customerType: formData.customerType,
                            customerEmail: formData.customerEmail,
                            customerName: formData.customerName,
                            ecCustomer: formData.ecCustomer
                        });
                    },
                    success: function (response) {
                        alert(response.message);
                        customerTypeTable.ajax.reload();
                        customerTypeEditor.close();
                    },
                    error: function (xhr) {
                        if (xhr.responseJSON) {
                            alert(xhr.responseJSON.message);
                        } else {
                            alert("An error occurred while processing your request.");
                        }
                    }
                },
                edit: {
                    type: "PUT",
                    url: `/pgManagement/customerTypeManagement/update?id={id}`,
                    contentType: 'application/json',
                    data: function (data) {
                        const id = Object.keys(data.data)[0];
                        const editedData = Object.values(data.data)[0];

                        const originalData = customerTypeTable
                            .rows()
                            .data()
                            .toArray()
                            .find((row) => String(row.id) === id);

                        const fullUpdateData = {
                            orderNo: editedData.orderNo ? parseInt(editedData.orderNo) : parseInt(originalData.orderNo),
                            receiptNo: editedData.receiptNo ? parseInt(editedData.receiptNo) : parseInt(originalData.orderNo),
                            customerType: editedData.customerType ? editedData.customerType : originalData.customerType,
                            customerEmail: editedData.customerEmail ? editedData.customerEmail : originalData.customerEmail,
                            customerName: editedData.customerName ? editedData.customerName : originalData.customerName,
                            ecCustomer: editedData.ecCustomer ? parseInt(editedData.ecCustomer) : originalData.ecCustomer ? parseInt(originalData.ecCustomer.id) : null
                        };

                        return JSON.stringify({
                            orderNo: fullUpdateData.orderNo,
                            receiptNo: fullUpdateData.receiptNo,
                            customerType: fullUpdateData.customerType,
                            customerEmail: fullUpdateData.customerEmail,
                            customerName: fullUpdateData.customerName,
                            ecCustomer: fullUpdateData.ecCustomer
                        });
                    },
                    success: function (response) {
                        alert(response.message);
                        customerTypeTable.ajax.reload();
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

        customerTypeEditor.on('preSubmit', function (e, o, action) {
            if (action !== 'remove') {
                let orderNo = this.field('orderNo');
                let receiptNo = this.field('receiptNo');
                let customerType = this.field('customerType');
                let customerEmail = this.field('customerEmail');
                let customerName = this.field('customerName');

                orderNo.error("");
                receiptNo.error("");
                customerType.error("");
                customerEmail.error("");
                customerName.error("");

                if (!customerType.isMultiValue()) {
                    if (!customerType.val()) {
                        customerType.error('A Customer Type must be given');
                    }
                }

                if (isHtml(customerType.val()) ) {
                    customerType.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }
                if (isHtml(customerEmail.val())) {
                    customerEmail.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }
                if (isHtml(customerName.val())) {
                    customerName.error("HTML tag characters (<, >) are not allowed. Please use [], {}, or () instead.");
                }

                if (isNaN(orderNo.val())) {
                    orderNo.error("Value must be a number");
                }
                if (isNaN(receiptNo.val())) {
                    receiptNo.error("Value must be a number");
                }

                if (this.inError()) {
                    return false;
                }
            }
        });

        const customerTypeTable = $("#customerTypeTable").DataTable({
            ajax: {
                url: "/pgManagement/customerTypeManagement/list",
                dataSrc: "",
            },
            columns: [
                { data: null, orderable: false, render: DataTable.render.select(), width: "3%" }, // 0
                { data: null, orderable: false, title: "No.", width: "3%", className: "dt-head-center dt-body-center" }, // 1
                { data: "orderNo", title: "Order", width: "3%", className: "dt-head-center dt-body-center" }, // 2
                { data: "receiptNo", title: "Receipt ID", width: "10%", className: "dt-head-center dt-body-center" }, // 3
                { data: "customerType", title: "Customer Type",
                    render: function (data, type, row) {
                        if (row.isNullable) {
                            return data + " (Empty Type)";
                        } else {
                            return unescapeSpecialCharacters(data)
                        }
                    },
                }, // 4
                { data: "customerEmail", title: "Email",
                    render: function (data, type, row) {
                        let emailList = data ? data.split("&#44;").map(v => v.trim()) : [];
                        emailList = emailList.length !== 0 ? emailList.map(email => `<p class="mb-0">${email}</p>`).join("") : ''
                        return emailList;
                    }
                }, // 5
                { data: "customerName", title: "Company Name",
                    render: function (data, type, row) {
                        return unescapeSpecialCharacters(data);
                    },
                }, // 6
                {
                    data: "ecCustomer",
                    title: "Receiver",
                    render: function (data, type, row) {
                        return data ? data.ecReceiver : '';
                    }
                }, // 7
                {
                    data: 'active',
                    title: "Active",
                    render: function (data, type, row) {
                        return !row.isNullable ? `<div class="form-check form-switch d-flex justify-content-center align-items-center">
                    <input class="form-check-input report-status-toggle" type="checkbox" ${row.active ? 'checked' : ''} >
                    </div>` : '';
                    },
                    className: "dt-center",
                    width: "80px",
                    orderable: false,
                }, // 8
                { data: 'createdAt', visible: false }, // 9
                { data: 'isNullable', visible: false }, // 10
            ],
            order: [ 10, "asc" ],
            lengthMenu: [
                [50, 100, -1],
                [50, 100, 'All']
            ],
            sorting: false,
            searching: false,
            select: {
                selector: 'td:first-child'
            },
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
                            text: "New Customer Type",
                            editor: customerTypeEditor,
                            className: 'btn btn-outline-primary width-xl'
                        },
                    ]
                }
            },
            initComplete: function () {
                $('.dt-button').removeClass('dt-button');

                initializeTableResize(this, {
                    minWidth: 40,
                    excludeLastColumns: 1
                })
            },
            rowCallback: function(row, data, index) {
                const pageInfo = this.api().page.info();
                const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
                $('td:eq(1)', row).html(reverseIndex);
            },
            createdRow: function (row) {
                const targetColumns = [2, 3, 4, 5, 6, 7];

                targetColumns.forEach((columnIndex) => {
                    $(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
                });
            },
        });

        customerTypeTable.on('length.dt', function(e, settings, len) {
            $("#tablePageInput").val(len);
        });

        setTimeout(() => {
            const pageLength = $("#tablePageInput").val() || 50;
            customerTypeTable.page.len(pageLength);
        }, 0);

        customerTypeTable.on('draw', function() {
            $('.report-status-toggle').on('change', function(e) {
                const $this = $(this);
                const data = customerTypeTable.row($(this).closest('tr')).data();
                const isChecked = $this.prop('checked');

                if (confirm(isChecked
                    ? 'Are you sure you want to activate this type?'
                    : 'Are you sure you want to disable this type?')) {

                    $.ajax({
                        url: `/pgManagement/customerTypeManagement/active?id=${data.id}`,
                        type: 'PUT',
                        success: function(response) {
                            if (response.status === 'success') {
                                customerTypeTable.ajax.reload(null, false);
                            } else {
                                alert('Failed to update active status. Please try again later.');
                            }
                        },
                        error: function() {
                            alert('Server Error. Please try again later.');
                            $(e.target).prop('checked', !$(e.target).prop('checked'));
                        }
                    });
                } else {
                    $this.prop('checked', !isChecked);
                }
            });
        });

        customerTypeTable.on('click', 'tbody td', function () {
            try {
                customerTypeEditor.inline(this, {
                    onReturn: 'submit',
                });
            } catch (error) {
                console.error(error);
            }
        });

        customerTypeEditor.on('open', function (e, mode, action) {
            if (mode === 'inline') {
                $('div.DTE_Field_InputControl textarea').on('keydown', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        customerTypeEditor.submit();
                    }
                });
            }
        });

        customerTypeTable.on('preEdit', function (e, node, data, items) {
            if (items.field.name() === 'customerType') {
                const val = items.field.val();
                items.field.val(unescapeSpecialCharacters(val));
            }
        });

        function deleteData() {
            const id = customerTypeTable.rows({ selected: true }).data().toArray().map(row => row.id);

            if (id.length === 0) {
                alert('Please select row to delete.');
                return;
            }

            $.ajax({
                method: 'DELETE',
                url: `/pgManagement/customerTypeManagement/delete?id=${id[0]}`,
                contentType: 'application/json',
                success: function (response) {
                    alert(response.message);
                    customerTypeTable.ajax.reload();
                },
                error: function (xhr) {
                    if (xhr.responseJSON) {
                        alert(xhr.responseJSON.message);
                    } else {
                        alert("An error occurred while processing your request.");
                    }
                }
            });
        }
    }
});