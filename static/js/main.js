// Tax Planning Assistant JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize Material Design components
    try {
        const select = document.querySelector('.mdc-select');
        if (select) {
            window.taxSelect = new mdc.select.MDCSelect(select);
            console.log('Tax status dropdown initialized');
        }
        
        document.querySelectorAll('.mdc-button').forEach(function(button) {
            new mdc.ripple.MDCRipple(button);
        });
    } catch (e) {
        console.error('Error initializing Material components:', e);
    }
    
    // Setup file input display
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    if (fileInput && fileList) {
        // File drop functionality
        const fileUploadContainer = document.querySelector('.file-upload-container');
        
        if (fileUploadContainer) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileUploadContainer.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                fileUploadContainer.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                fileUploadContainer.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                fileUploadContainer.classList.add('highlight');
            }
            
            function unhighlight() {
                fileUploadContainer.classList.remove('highlight');
            }
            
            fileUploadContainer.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                fileInput.files = files;
                
                // Trigger change event
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        }
        
        // File input change handler
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = '';
            
            if (this.files.length === 0) {
                return;
            }
            
            Array.from(this.files).forEach(function(file) {
                const item = document.createElement('div');
                item.className = 'file-item';
                
                // Determine icon based on file type
                let iconName = 'description';
                if (file.name.toLowerCase().endsWith('.pdf')) {
                    iconName = 'picture_as_pdf';
                } else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                    iconName = 'image';
                }
                
                // Format file size
                const fileSize = formatFileSize(file.size);
                
                item.innerHTML = `
                    <i class="material-icons-round">${iconName}</i>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                    <i class="material-icons-round remove-file" data-filename="${file.name}">close</i>
                `;
                
                fileList.appendChild(item);
            });
            
            // Add remove file functionality
            document.querySelectorAll('.remove-file').forEach(function(button) {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const fileName = this.getAttribute('data-filename');
                    removeFileFromInput(fileName);
                    this.closest('.file-item').remove();
                });
            });
        });
        
        // Helper function to remove a file from the input
        function removeFileFromInput(fileName) {
            const dt = new DataTransfer();
            
            Array.from(fileInput.files)
                .filter(file => file.name !== fileName)
                .forEach(file => dt.items.add(file));
            
            fileInput.files = dt.files;
        }
        
        // Helper function to format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
    
    // Setup form submission
    const form = document.getElementById('taxForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check for tax status
            if (!window.taxSelect || !window.taxSelect.value) {
                showNotification('Please select a tax filing status', 'error');
                return;
            }
            
            // Check for files
            if (!fileInput || fileInput.files.length === 0) {
                showNotification('Please select at least one file to upload', 'error');
                return;
            }
            
            // Show loading overlay
            const overlay = document.createElement('div');
            overlay.className = 'processing-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p class="processing-text">Processing your documents...</p>
            `;
            document.body.appendChild(overlay);
            
            // Prepare form data
            const formData = new FormData();
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('files[]', fileInput.files[i]);
                console.log(`Adding file: ${fileInput.files[i].name}, size: ${fileInput.files[i].size} bytes`);
            }
            formData.append('tax_status', window.taxSelect.value);
            console.log('Tax status selected:', window.taxSelect.value);
            
            // Add timeout to prevent indefinite loading
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out after 60 seconds')), 60000);
            });
            
            // Submit the form with timeout
            console.log('Sending upload request to /upload...');
            Promise.race([
                fetch('/upload', {
                    method: 'POST',
                    body: formData
                }),
                timeoutPromise
            ])
            .then(function(response) {
                console.log('Received response with status:', response.status);
                return response.json();
            })
            .then(function(data) {
                // Hide loading
                document.body.removeChild(overlay);
                
                if (data.error) {
                    showNotification('Error: ' + data.error, 'error');
                    return;
                }
                
                // Display results
                try {
                    const resultsContainer = document.getElementById('results');
                    if (resultsContainer) {
                        // Update filing status
                        if (document.getElementById('filingStatus')) 
                            document.getElementById('filingStatus').textContent = formatTaxStatus(data.tax_status) || 'Single';
                        
                        // Update processed files information
                        if (document.getElementById('processedFiles')) {
                            const fileNames = Array.from(fileInput.files).map(file => {
                                // Determine document type and add badge
                                let docType = 'unknown';
                                if (data.document_types && data.document_types[file.name]) {
                                    docType = data.document_types[file.name].toLowerCase();
                                }
                                
                                return `<span class="document-badge badge-${docType}">${docType.toUpperCase()}</span> ${file.name}`;
                            }).join("<br>");
                            
                            document.getElementById('processedFiles').innerHTML = fileNames;
                        }
                            
                        // Update income breakdown if available
                        if (data.income) {
                            if (document.getElementById('wagesAmount'))
                                document.getElementById('wagesAmount').textContent = formatCurrency(data.income.wages || 0);
                            if (document.getElementById('interestAmount'))
                                document.getElementById('interestAmount').textContent = formatCurrency(data.income.interest || 0);
                            if (document.getElementById('dividendsAmount'))
                                document.getElementById('dividendsAmount').textContent = formatCurrency(data.income.dividends || 0);
                            if (document.getElementById('businessAmount'))
                                document.getElementById('businessAmount').textContent = formatCurrency(data.income.business || 0);
                            if (document.getElementById('capitalGainsAmount'))
                                document.getElementById('capitalGainsAmount').textContent = formatCurrency(data.income.capital_gains || 0);
                            if (document.getElementById('iraAmount'))
                                document.getElementById('iraAmount').textContent = formatCurrency(data.income.ira_distributions || 0);
                        }
                        
                        // Update total income in both places
                        if (document.getElementById('totalIncome'))
                            document.getElementById('totalIncome').textContent = formatCurrency(data.total_income || 0);
                        if (document.getElementById('calcTotalIncome'))
                            document.getElementById('calcTotalIncome').textContent = formatCurrency(data.total_income || 0);
                        
                        // Update tax calculation
                        if (document.getElementById('totalDeductions'))
                            document.getElementById('totalDeductions').textContent = formatCurrency(data.total_deductions || 0);
                        if (document.getElementById('taxableIncome'))
                            document.getElementById('taxableIncome').textContent = formatCurrency(data.taxable_income || 0);
                        if (document.getElementById('calculatedTax'))
                            document.getElementById('calculatedTax').textContent = formatCurrency(data.tax || 0);
                        if (document.getElementById('taxPayments'))
                            document.getElementById('taxPayments').textContent = formatCurrency(data.tax_paid || 0);
                        
                        // Calculate and display refund or tax due
                        if (document.getElementById('taxDue')) {
                            const isRefund = data.is_refund;
                            const refundOrDue = data.refund_or_owe || 0;
                            const formattedAmount = formatCurrency(refundOrDue);
                            
                            document.getElementById('taxDue').textContent = isRefund
                                ? formattedAmount + ' Refund'
                                : formattedAmount + ' Due';
                                
                            document.getElementById('taxDue').className = isRefund 
                                ? 'mdc-data-table__cell positive-amount' 
                                : 'mdc-data-table__cell negative-amount';
                        }
                        
                        // Display warnings if any
                        if (data.warnings && data.warnings.length > 0) {
                            const warningsContainer = document.getElementById('warningsContainer');
                            const warningsElement = document.getElementById('warnings');
                            if (warningsContainer && warningsElement) {
                                warningsElement.innerHTML = '';
                                const warningsList = document.createElement('ul');
                                
                                data.warnings.forEach(function(warning) {
                                    const warningItem = document.createElement('li');
                                    warningItem.textContent = warning;
                                    warningsList.appendChild(warningItem);
                                });
                                
                                warningsElement.appendChild(warningsList);
                                warningsContainer.style.display = 'block';
                            }
                        }
                        
                        // Show results with animation
                        resultsContainer.style.display = 'block';
                        resultsContainer.classList.add('fade-in');
                        
                        // Scroll to results
                        setTimeout(() => {
                            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 300);
                        
                        // Add debugging for troubleshooting
                        console.log('Result data:', data);
                    }
                } catch (err) {
                    console.error('Error displaying results:', err);
                    showNotification('Error displaying results: ' + err.message, 'error');
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
                // Hide loading
                if (document.querySelector('.processing-overlay')) {
                    document.body.removeChild(document.querySelector('.processing-overlay'));
                }
                showNotification('An error occurred: ' + error.message, 'error');
            });
        });
    }
    
    // Helper function to format currency
    function formatCurrency(value) {
        if (typeof value === 'string') {
            value = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    }
    
    // Helper function to format tax status
    function formatTaxStatus(status) {
        if (!status) return 'Single';
        
        switch(status) {
            case 'single': return 'Single';
            case 'married_jointly': return 'Married Filing Jointly';
            case 'married_separate': return 'Married Filing Separately';
            case 'head_household': return 'Head of Household';
            default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
        }
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            document.body.removeChild(notification);
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set icon based on type
        let icon = 'info';
        if (type === 'error') icon = 'error';
        if (type === 'success') icon = 'check_circle';
        if (type === 'warning') icon = 'warning';
        
        notification.innerHTML = `
            <i class="material-icons-round">${icon}</i>
            <span>${message}</span>
            <i class="material-icons-round close-notification">close</i>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Add animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
});
