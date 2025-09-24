// Premium Business Card Generator JavaScript

class BusinessCardGenerator {
    constructor() {
        this.currentTemplate = 'minimalist';
        this.qrCode = null;
        this.isFlipped = false;
        
        // Template configurations
        this.templates = {
            minimalist: {
                name: "Modern Minimalist",
                primaryColor: "#2563eb",
                secondaryColor: "#64748b",
                backgroundColor: "#ffffff",
                textColor: "#1e293b",
                accentColor: "#3b82f6"
            },
            professional: {
                name: "Professional Dark",
                primaryColor: "#fbbf24",
                secondaryColor: "#d97706",
                backgroundColor: "#1e293b",
                textColor: "#f8fafc",
                accentColor: "#f59e0b"
            },
            creative: {
                name: "Creative Gradient",
                primaryColor: "#8b5cf6",
                secondaryColor: "#ec4899",
                backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textColor: "#ffffff",
                accentColor: "#a855f7"
            },
            corporate: {
                name: "Corporate Classic",
                primaryColor: "#1e40af",
                secondaryColor: "#3730a3",
                backgroundColor: "#ffffff",
                textColor: "#1e293b",
                accentColor: "#2563eb"
            },
            tech: {
                name: "Tech Futuristic",
                primaryColor: "#06d6a0",
                secondaryColor: "#118ab2",
                backgroundColor: "#0f172a",
                textColor: "#e2e8f0",
                accentColor: "#10b981"
            }
        };

        // Sample data
        this.sampleData = {
            name: "Alex Johnson",
            title: "Senior Software Engineer",
            company: "TechCorp Solutions",
            department: "Product Development",
            email: "alex.johnson@techcorp.com",
            phone: "+1 (555) 123-4567",
            website: "www.alexjohnson.dev",
            linkedin: "linkedin.com/in/alexjohnson",
            github: "github.com/alexjohnson",
            about: "Passionate full-stack developer with 8+ years of experience building scalable web applications and leading development teams.",
            skills: "React, Node.js, Python, AWS, TypeScript, MongoDB"
        };

        this.init();
    }

    init() {
        this.bindEventListeners();
        this.loadSampleData();
        this.loadFromStorage();
        this.updateCard();
        this.generateQRCode();
    }

    bindEventListeners() {
        // Template selection
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.switchTemplate(template);
            });
        });

        // Form inputs
        const form = document.getElementById('businessCardForm');
        form.addEventListener('input', this.debounce((e) => {
            this.updateCard();
            this.saveToStorage();
        }, 300));

        // Character counting for about textarea
        const aboutTextarea = document.getElementById('about');
        aboutTextarea.addEventListener('input', this.updateCharacterCount.bind(this));

        // Image uploads
        document.getElementById('profilePicture').addEventListener('change', this.handleProfilePictureUpload.bind(this));
        document.getElementById('companyLogo').addEventListener('change', this.handleCompanyLogoUpload.bind(this));

        // Font family change
        document.getElementById('fontFamily').addEventListener('change', this.updateCardFont.bind(this));

        // Accent color change
        document.getElementById('accentColor').addEventListener('change', this.updateAccentColor.bind(this));

        // Card flip
        document.getElementById('flipCard').addEventListener('click', this.flipCard.bind(this));
        document.getElementById('cardContainer').addEventListener('click', this.flipCard.bind(this));

        // Reset form
        document.getElementById('resetForm').addEventListener('click', this.resetForm.bind(this));

        // Export functions
        document.getElementById('exportPNG').addEventListener('click', this.exportPNG.bind(this));
        document.getElementById('exportPDF').addEventListener('click', this.exportPDF.bind(this));
        document.getElementById('exportVCard').addEventListener('click', this.exportVCard.bind(this));

        // Form validation
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });
    }

    switchTemplate(templateId) {
        // Update active template option
        document.querySelectorAll('.template-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateId}"]`).classList.add('active');

        // Update current template
        this.currentTemplate = templateId;
        
        // Update card template
        const businessCard = document.getElementById('businessCard');
        businessCard.setAttribute('data-template', templateId);

        // Update accent color input
        const accentColorInput = document.getElementById('accentColor');
        accentColorInput.value = this.templates[templateId].accentColor;

        // Regenerate QR code with new template colors
        this.generateQRCode();

        // Save template selection
        this.saveToStorage();

        // Add animation class
        businessCard.style.animation = 'none';
        businessCard.offsetHeight; // Trigger reflow
        businessCard.style.animation = 'cardSlideIn 0.6s ease-out';
    }

    loadSampleData() {
        // Load sample data into form fields
        Object.keys(this.sampleData).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = this.sampleData[key];
            }
        });
    }

    updateCard() {
        // Update name
        const name = document.getElementById('fullName').value || this.sampleData.name;
        document.getElementById('displayName').textContent = name;

        // Update title
        const title = document.getElementById('jobTitle').value || this.sampleData.title;
        document.getElementById('displayTitle').textContent = title;

        // Update company
        const company = document.getElementById('company').value || this.sampleData.company;
        document.getElementById('displayCompany').textContent = company;

        // Update contact information
        this.updateContactInfo();

        // Update social links
        this.updateSocialLinks();

        // Update about section
        const about = document.getElementById('about').value || this.sampleData.about;
        document.getElementById('displayAbout').textContent = about;

        // Update skills
        this.updateSkills();

        // Update address
        this.updateAddress();

        // Generate QR code
        this.generateQRCode();
    }

    updateContactInfo() {
        const email = document.getElementById('email').value || this.sampleData.email;
        const phone = document.getElementById('phone').value || this.sampleData.phone;
        const phoneSecondary = document.getElementById('phoneSecondary').value;
        const website = document.getElementById('website').value || this.sampleData.website;

        document.getElementById('displayEmail').textContent = email;
        document.getElementById('displayPhone').textContent = phone;

        // Show/hide secondary phone
        const phoneSecondaryContact = document.getElementById('phoneSecondaryContact');
        if (phoneSecondary) {
            document.getElementById('displayPhoneSecondary').textContent = phoneSecondary;
            phoneSecondaryContact.classList.remove('hidden');
        } else {
            phoneSecondaryContact.classList.add('hidden');
        }

        // Show/hide website
        const websiteContact = document.getElementById('websiteContact');
        if (website && website !== this.sampleData.website) {
            document.getElementById('displayWebsite').textContent = website;
            websiteContact.classList.remove('hidden');
        } else if (website === this.sampleData.website) {
            document.getElementById('displayWebsite').textContent = website;
            websiteContact.classList.remove('hidden');
        } else {
            websiteContact.classList.add('hidden');
        }
    }

    updateSocialLinks() {
        const socialPlatforms = ['linkedin', 'github', 'twitter', 'instagram'];
        
        socialPlatforms.forEach(platform => {
            const input = document.getElementById(platform);
            const link = document.getElementById(`${platform}Link`);
            
            if (input.value) {
                let url = input.value;
                
                // Format URLs
                if (platform === 'linkedin' && !url.startsWith('http')) {
                    url = url.startsWith('linkedin.com') ? `https://${url}` : `https://linkedin.com/in/${url}`;
                } else if (platform === 'github' && !url.startsWith('http')) {
                    url = url.startsWith('github.com') ? `https://${url}` : `https://github.com/${url}`;
                } else if (platform === 'twitter') {
                    url = url.startsWith('@') ? `https://twitter.com/${url.slice(1)}` : `https://twitter.com/${url}`;
                } else if (platform === 'instagram') {
                    url = url.startsWith('@') ? `https://instagram.com/${url.slice(1)}` : `https://instagram.com/${url}`;
                }
                
                link.href = url;
                link.classList.remove('hidden');
            } else {
                link.classList.add('hidden');
            }
        });
    }

    updateSkills() {
        const skillsInput = document.getElementById('skills').value || this.sampleData.skills;
        const skillsContainer = document.getElementById('displaySkills');
        
        // Clear existing skills
        skillsContainer.innerHTML = '';
        
        // Split skills by comma and create tags
        const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
        
        skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });
    }

    updateAddress() {
        const address = document.getElementById('address').value;
        const addressSection = document.getElementById('addressSection');
        
        if (address) {
            document.getElementById('displayAddress').textContent = address;
            addressSection.classList.remove('hidden');
        } else {
            addressSection.classList.add('hidden');
        }
    }

    updateCharacterCount() {
        const textarea = document.getElementById('about');
        const counter = document.querySelector('.character-count');
        const current = textarea.value.length;
        const max = parseInt(textarea.getAttribute('maxlength'));
        
        counter.textContent = `${current}/${max} characters`;
        
        if (current > max * 0.9) {
            counter.style.color = 'var(--color-warning)';
        } else if (current > max * 0.8) {
            counter.style.color = 'var(--color-info)';
        } else {
            counter.style.color = 'var(--color-text-secondary)';
        }
    }

    handleProfilePictureUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Please select an image smaller than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profileImage').src = e.target.result;
                this.saveToStorage();
            };
            reader.readAsDataURL(file);
        }
    }

    handleCompanyLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('Please select an image smaller than 2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const logoDisplay = document.getElementById('companyLogoDisplay');
                logoDisplay.src = e.target.result;
                logoDisplay.classList.remove('hidden');
                this.saveToStorage();
            };
            reader.readAsDataURL(file);
        }
    }

    updateCardFont() {
        const fontFamily = document.getElementById('fontFamily').value;
        const businessCard = document.getElementById('businessCard');
        businessCard.style.fontFamily = fontFamily;
        this.saveToStorage();
    }

    updateAccentColor() {
        const accentColor = document.getElementById('accentColor').value;
        const businessCard = document.getElementById('businessCard');
        
        // Update CSS custom properties for the current template
        businessCard.style.setProperty('--accent-color', accentColor);
        
        // Update template colors
        this.templates[this.currentTemplate].accentColor = accentColor;
        
        this.generateQRCode();
        this.saveToStorage();
    }

    generateQRCode() {
        const qrContainer = document.getElementById('qrCode');
        qrContainer.innerHTML = ''; // Clear existing QR code
        
        // Get form data
        const name = document.getElementById('fullName').value || this.sampleData.name;
        const title = document.getElementById('jobTitle').value || this.sampleData.title;
        const company = document.getElementById('company').value || this.sampleData.company;
        const email = document.getElementById('email').value || this.sampleData.email;
        const phone = document.getElementById('phone').value || this.sampleData.phone;
        const website = document.getElementById('website').value || this.sampleData.website;
        
        // Create vCard data
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${company}
TITLE:${title}
EMAIL:${email}
TEL:${phone}
URL:${website}
END:VCARD`;

        // Determine QR code colors based on template
        const template = this.templates[this.currentTemplate];
        const darkColor = template.textColor;
        const lightColor = template.backgroundColor.includes('gradient') ? '#ffffff' : template.backgroundColor;

        // Generate QR code
        try {
            this.qrCode = new QRCode(qrContainer, {
                text: vCardData,
                width: 80,
                height: 80,
                colorDark: darkColor,
                colorLight: lightColor === '#ffffff' || lightColor.includes('gradient') ? '#ffffff' : lightColor,
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch (error) {
            console.error('QR Code generation failed:', error);
        }
    }

    flipCard() {
        const businessCard = document.getElementById('businessCard');
        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            businessCard.classList.add('flipped');
        } else {
            businessCard.classList.remove('flipped');
        }
    }

    validateForm() {
        const requiredFields = ['fullName', 'email'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();
            
            if (!value) {
                field.style.borderColor = 'var(--color-error)';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField.value && !emailRegex.test(emailField.value)) {
            emailField.style.borderColor = 'var(--color-error)';
            isValid = false;
        }
        
        if (!isValid) {
            alert('Please fill in all required fields with valid information.');
        }
        
        return isValid;
    }

    resetForm() {
        if (confirm('Are you sure you want to reset all fields? This will clear your current data.')) {
            document.getElementById('businessCardForm').reset();
            document.getElementById('profileImage').src = 'https://images.unsplash.com/photo-1494790108755-2616b0c2c5b6?w=150&h=150&fit=crop&crop=face';
            document.getElementById('companyLogoDisplay').classList.add('hidden');
            this.loadSampleData();
            this.updateCard();
            localStorage.removeItem('businessCardData');
        }
    }

    async exportPNG() {
        const card = document.getElementById('businessCard');
        const side = this.isFlipped ? card.querySelector('.card-back') : card.querySelector('.card-front');
        
        try {
            const canvas = await html2canvas(side, {
                scale: 3,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                width: 350,
                height: 200
            });
            
            const link = document.createElement('a');
            link.download = `${this.getFileName()}_business_card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('PNG export failed:', error);
            alert('Export failed. Please try again.');
        }
    }

    async exportPDF() {
        const card = document.getElementById('businessCard');
        const side = this.isFlipped ? card.querySelector('.card-back') : card.querySelector('.card-front');
        
        try {
            const canvas = await html2canvas(side, {
                scale: 4,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                width: 350,
                height: 200
            });
            
            const { jsPDF } = window.jspdf;
            
            // Standard business card dimensions in mm (3.5" x 2")
            const cardWidth = 88.9;  // 3.5 inches
            const cardHeight = 50.8; // 2 inches
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [cardWidth, cardHeight]
            });
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, cardWidth, cardHeight);
            pdf.save(`${this.getFileName()}_business_card.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Export failed. Please try again.');
        }
    }

    exportVCard() {
        const name = document.getElementById('fullName').value || this.sampleData.name;
        const title = document.getElementById('jobTitle').value || this.sampleData.title;
        const company = document.getElementById('company').value || this.sampleData.company;
        const email = document.getElementById('email').value || this.sampleData.email;
        const phone = document.getElementById('phone').value || this.sampleData.phone;
        const phoneSecondary = document.getElementById('phoneSecondary').value;
        const website = document.getElementById('website').value || this.sampleData.website;
        const address = document.getElementById('address').value;
        
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${company}
TITLE:${title}
EMAIL:${email}
TEL;TYPE=WORK:${phone}${phoneSecondary ? `\nTEL;TYPE=CELL:${phoneSecondary}` : ''}
URL:${website}${address ? `\nADR;TYPE=WORK:;;${address.replace(/\n/g, ';')};;;;` : ''}
END:VCARD`;

        const blob = new Blob([vCardData], { type: 'text/vcard' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.getFileName()}_contact.vcf`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    getFileName() {
        const name = document.getElementById('fullName').value || this.sampleData.name;
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    saveToStorage() {
        const formData = new FormData(document.getElementById('businessCardForm'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add additional data
        data.template = this.currentTemplate;
        data.accentColor = document.getElementById('accentColor').value;
        data.fontFamily = document.getElementById('fontFamily').value;
        data.profileImageSrc = document.getElementById('profileImage').src;
        data.companyLogoSrc = document.getElementById('companyLogoDisplay').src;
        
        localStorage.setItem('businessCardData', JSON.stringify(data));
    }

    loadFromStorage() {
        const savedData = localStorage.getItem('businessCardData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Load form data
                Object.keys(data).forEach(key => {
                    const input = document.getElementById(key);
                    if (input && data[key]) {
                        input.value = data[key];
                    }
                });
                
                // Load template
                if (data.template) {
                    this.switchTemplate(data.template);
                }
                
                // Load images
                if (data.profileImageSrc && data.profileImageSrc.startsWith('data:')) {
                    document.getElementById('profileImage').src = data.profileImageSrc;
                }
                
                if (data.companyLogoSrc && data.companyLogoSrc.startsWith('data:')) {
                    document.getElementById('companyLogoDisplay').src = data.companyLogoSrc;
                    document.getElementById('companyLogoDisplay').classList.remove('hidden');
                }
                
                // Load font and color
                if (data.fontFamily) {
                    document.getElementById('fontFamily').value = data.fontFamily;
                    this.updateCardFont();
                }
                
                if (data.accentColor) {
                    document.getElementById('accentColor').value = data.accentColor;
                    this.updateAccentColor();
                }
                
            } catch (error) {
                console.error('Failed to load saved data:', error);
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BusinessCardGenerator();
});