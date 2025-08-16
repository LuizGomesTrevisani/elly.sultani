
// Global variables
let properties = [];
let adminLoggedIn = false;
const adminPassword = "luxury2024"; // Change this to a secure password
let currentSlideIndex = 0;
let totalSlides = 0;

// Chatbot responses
const chatbotResponses = {
    "que propriedades estão disponíveis?": "Você pode visualizar todas as propriedades disponíveis na seção 'Empreendimentos' do nosso site.",
    "como agendar uma visita?": "Basta clicar no botão 'Agendar Visita' em qualquer página de propriedade.",
    "qual é o preço da propriedade x?": "Por favor, forneça o nome da propriedade para que possamos enviar o preço exato.",
    "vocês ajudam com financiamento?": "Sim, auxiliamos em todo o processo de financiamento. Entre em contato para mais detalhes.",
    "onde vocês atuam?": "Atuamos principalmente em bairros premium e áreas de luxo."
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadProperties();
    initializeModals();
    initializeChatbot();
    initializeAdminPanel();
    initializeForms();
    loadSampleProperties();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Modal functionality
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Load and display properties
function loadProperties() {
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
        properties = JSON.parse(savedProperties);
    }
    displayProperties();
    updateFeaturedProperties();
    updateSchedulePropertyOptions();
}

function saveProperties() {
    localStorage.setItem('properties', JSON.stringify(properties));
}

function displayProperties() {
    const propertiesGrid = document.getElementById('properties-grid');
    propertiesGrid.innerHTML = '';

    properties.forEach((property, index) => {
        const propertyCard = createPropertyCard(property, index);
        propertiesGrid.appendChild(propertyCard);
    });
}

function createPropertyCard(property, index) {
    const card = document.createElement('div');
    card.className = `property-card ${property.status}`;
    card.onclick = () => openPropertyDetail(index);

    const imageUrl = property.images && property.images.length > 0 
        ? property.images[0] 
        : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop';

    const statusText = {
        'available': 'Disponível',
        'reserved': 'Reservado',
        'sold': 'Vendido'
    };

    const pdfCount = property.pdfs ? property.pdfs.length : 0;
    const pdfBadge = pdfCount > 0 ? `<div class="pdf-badge">${pdfCount} PDF${pdfCount > 1 ? 's' : ''}</div>` : '';

    card.innerHTML = `
        <div class="property-image" style="background-image: url('${imageUrl}')">
            <div class="admin-controls ${adminLoggedIn ? 'active' : ''}">
                <button class="admin-btn edit-btn" onclick="event.stopPropagation(); openEditModal(${index})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn delete-btn" onclick="event.stopPropagation(); deleteProperty(${index})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="property-status status-${property.status}">${statusText[property.status]}</div>
            ${pdfBadge}
        </div>
        <div class="property-content">
            <h3>${property.name}</h3>
            <div class="property-price">${property.price}</div>
            <p>${property.description}</p>
            ${pdfCount > 0 ? `<div class="pdf-info"><i class="fas fa-file-pdf"></i> ${pdfCount} documento${pdfCount > 1 ? 's' : ''} disponível${pdfCount > 1 ? 'is' : ''}</div>` : ''}
            <button class="btn-primary" onclick="event.stopPropagation(); openScheduleModal('${property.name}')">Agendar Visita</button>
        </div>
    `;

    return card;
}

function updateFeaturedProperties() {
    const featuredGrid = document.getElementById('featured-properties');
    featuredGrid.innerHTML = '';

    const availableProperties = properties.filter(p => p.status === 'available').slice(0, 3);
    
    availableProperties.forEach((property, index) => {
        const propertyIndex = properties.findIndex(p => p.name === property.name);
        const card = createPropertyCard(property, propertyIndex);
        featuredGrid.appendChild(card);
    });
}

// Property detail modal
function openPropertyDetail(index) {
    const property = properties[index];
    const modal = document.getElementById('property-modal');
    const detailContent = document.getElementById('property-detail');

    const statusText = {
        'available': 'Disponível',
        'reserved': 'Reservado',
        'sold': 'Vendido'
    };

    const images = property.images && property.images.length > 0 
        ? property.images 
        : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop'];

    let carouselHTML = '';
    if (images.length > 1) {
        const carouselSlides = images.map((img, i) => 
            `<div class="carousel-slide ${i === 0 ? 'active' : ''}">
                <img src="${img}" alt="${property.name}">
            </div>`
        ).join('');

        const indicators = images.map((_, i) => 
            `<div class="carousel-indicator ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`
        ).join('');

        carouselHTML = `
            <div class="property-image-carousel">
                <div class="carousel-container">
                    ${carouselSlides}
                    <button class="carousel-nav carousel-prev" onclick="previousSlide()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-nav carousel-next" onclick="nextSlide()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="carousel-counter">
                        <span id="current-slide">1</span> / ${images.length}
                    </div>
                    <div class="carousel-indicators">
                        ${indicators}
                    </div>
                </div>
            </div>
        `;
    } else {
        carouselHTML = `
            <div class="property-image-carousel">
                <div class="carousel-container">
                    <div class="carousel-slide active">
                        <img src="${images[0]}" alt="${property.name}">
                    </div>
                </div>
            </div>
        `;
    }

    detailContent.innerHTML = `
        <h2>${property.name}</h2>
        <div class="property-price" style="font-size: 2rem; margin: 1rem 0;">${property.price}</div>
        <div class="property-status status-${property.status}" style="display: inline-block; margin-bottom: 1rem;">${statusText[property.status]}</div>
        
        <div class="property-images">
            <h3>Galeria de Imagens</h3>
            ${carouselHTML}
        </div>

        <div style="margin: 2rem 0;">
            <h3>Descrição</h3>
            <p style="line-height: 1.8;">${property.description}</p>
        </div>

        <div style="margin: 2rem 0;">
            <h3>Endereço</h3>
            <p>${property.address}</p>
        </div>

        ${property.pdfs && property.pdfs.length > 0 ? `
            <div class="property-pdfs">
                <h3>Documentos</h3>
                <div class="pdf-list">
                    ${property.pdfs.map(pdf => `
                        <div class="pdf-item" onclick="openPDFViewer('${pdf.url}', '${pdf.name}')">
                            <i class="fas fa-file-pdf"></i>
                            <div class="pdf-name">${pdf.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${property.video ? `
            <div style="margin: 2rem 0;">
                <h3>Tour Virtual</h3>
                <iframe width="100%" height="315" src="${property.video}" frameborder="0" allowfullscreen></iframe>
            </div>
        ` : ''}

        <div class="property-map">
            <iframe 
                width="100%" 
                height="300" 
                frameborder="0" 
                style="border:0" 
                src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(property.address)}"
                allowfullscreen>
            </iframe>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
            <button class="btn-primary" onclick="openScheduleModal('${property.name}')">Agendar Visita</button>
            <button class="btn-secondary" onclick="openWhatsAppChat()" style="margin-left: 1rem;">Entrar em Contato via WhatsApp</button>
        </div>
    `;

    // Initialize carousel
    currentSlideIndex = 0;
    totalSlides = images.length;

    modal.style.display = 'block';
}

// Property filtering
function initializePropertyFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProperties(filter);
        });
    });
}

function filterProperties(filter) {
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// Schedule visit functionality
function openScheduleModal(propertyName = '') {
    const modal = document.getElementById('schedule-modal');
    const propertySelect = document.getElementById('selected-property');
    
    if (propertyName) {
        propertySelect.value = propertyName;
    }
    
    modal.style.display = 'block';
}

function updateSchedulePropertyOptions() {
    const propertySelect = document.getElementById('selected-property');
    propertySelect.innerHTML = '<option value="">Select a property</option>';
    
    properties.forEach(property => {
        const option = document.createElement('option');
        option.value = property.name;
        option.textContent = property.name;
        propertySelect.appendChild(option);
    });
}

// WhatsApp chatbot functionality
function initializeChatbot() {
    const whatsappFloat = document.getElementById('whatsapp-chat');
    const chatbotModal = document.getElementById('chatbot-modal');
    
    whatsappFloat.addEventListener('click', function() {
        chatbotModal.style.display = 'block';
    });

    // Enter key functionality for chatbot input
    const chatbotInput = document.getElementById('chatbot-input');
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function askQuestion(question) {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<p>${question}</p>`;
    messagesContainer.appendChild(userMessage);
    
    // Add bot response
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        
        const response = chatbotResponses[question.toLowerCase()] || 
            "Não tenho uma resposta específica para isso. Gostaria de falar diretamente com Elli Sultani Junior?";
        
        if (!chatbotResponses[question.toLowerCase()]) {
            botMessage.innerHTML = `
                <p>${response}</p>
                <button class="btn-primary" onclick="openWhatsAppChat()" style="margin-top: 10px;">Falar com Elli Sultani Junior</button>
            `;
        } else {
            botMessage.innerHTML = `<p>${response}</p>`;
        }
        
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (message) {
        askQuestion(message);
        input.value = '';
    }
}

function openWhatsAppChat() {
    const whatsappNumber = "5511999999999"; // Replace with actual WhatsApp number
    const message = "Olá! Estou interessado em suas propriedades de luxo e gostaria de mais informações.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Carousel functions
function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        currentSlideIndex++;
    } else {
        currentSlideIndex = 0;
    }
    updateCarousel();
}

function previousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
    } else {
        currentSlideIndex = totalSlides - 1;
    }
    updateCarousel();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateCarousel();
}

function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const counter = document.getElementById('current-slide');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlideIndex);
    });

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlideIndex);
    });

    if (counter) {
        counter.textContent = currentSlideIndex + 1;
    }
}

// Admin panel functionality
function initializeAdminPanel() {
    const adminLoginForm = document.getElementById('admin-login-form');
    
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        
        if (password === adminPassword) {
            adminLoggedIn = true;
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            displayProperties(); // Refresh to show admin controls
        } else {
            alert('Senha incorreta');
        }
    });

    const propertyForm = document.getElementById('property-form');
    propertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addProperty();
    });

    const editPropertyForm = document.getElementById('edit-property-form');
    editPropertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveEditProperty();
    });

    initializePropertyFilters();
}

function openEditModal(index) {
    const property = properties[index];
    const modal = document.getElementById('edit-property-modal');
    
    document.getElementById('edit-property-index').value = index;
    document.getElementById('edit-property-name').value = property.name;
    document.getElementById('edit-property-address').value = property.address;
    document.getElementById('edit-property-price').value = property.price;
    document.getElementById('edit-property-description').value = property.description;
    document.getElementById('edit-property-images').value = property.images ? property.images.join('\n') : '';
    document.getElementById('edit-property-pdfs').value = property.pdfs ? property.pdfs.map(pdf => pdf.url).join('\n') : '';
    document.getElementById('edit-property-video').value = property.video || '';
    document.getElementById('edit-property-status').value = property.status;
    
    modal.style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-property-modal').style.display = 'none';
}

function saveEditProperty() {
    const index = parseInt(document.getElementById('edit-property-index').value);
    const name = document.getElementById('edit-property-name').value;
    const address = document.getElementById('edit-property-address').value;
    const price = document.getElementById('edit-property-price').value;
    const description = document.getElementById('edit-property-description').value;
    const imagesText = document.getElementById('edit-property-images').value;
    const pdfsText = document.getElementById('edit-property-pdfs').value;
    const video = document.getElementById('edit-property-video').value;
    const status = document.getElementById('edit-property-status').value;

    const images = imagesText.split('\n').filter(url => url.trim() !== '');
    const pdfs = pdfsText.split('\n').filter(url => url.trim() !== '').map(url => {
        const fileName = url.split('/').pop().split('?')[0] || 'Documento';
        return { url: url.trim(), name: fileName };
    });

    properties[index] = {
        name,
        address,
        price,
        description,
        images,
        pdfs: pdfs || [],
        video,
        status
    };

    saveProperties();
    displayProperties();
    updateFeaturedProperties();
    updateSchedulePropertyOptions();
    closeEditModal();
    
    alert('Propriedade atualizada com sucesso!');
}

function deleteProperty(index) {
    if (confirm('Tem certeza que deseja excluir esta propriedade?')) {
        properties.splice(index, 1);
        saveProperties();
        displayProperties();
        updateFeaturedProperties();
        updateSchedulePropertyOptions();
        alert('Propriedade excluída com sucesso!');
    }
}

function addProperty() {
    const name = document.getElementById('property-name').value;
    const address = document.getElementById('property-address').value;
    const price = document.getElementById('property-price').value;
    const description = document.getElementById('property-description').value;
    const imagesText = document.getElementById('property-images').value;
    const pdfsText = document.getElementById('property-pdfs').value;
    const video = document.getElementById('property-video').value;
    const status = document.getElementById('property-status').value;

    const images = imagesText.split('\n').filter(url => url.trim() !== '');
    const pdfs = pdfsText.split('\n').filter(url => url.trim() !== '').map(url => {
        const fileName = url.split('/').pop().split('?')[0] || 'Documento';
        return { url: url.trim(), name: fileName };
    });

    const newProperty = {
        name,
        address,
        price,
        description,
        images,
        pdfs: pdfs || [],
        video,
        status
    };

    properties.push(newProperty);
    saveProperties();
    displayProperties();
    updateFeaturedProperties();
    updateSchedulePropertyOptions();

    // Reset form
    document.getElementById('property-form').reset();
    alert('Propriedade adicionada com sucesso!');
}

function updateOperatingRegion() {
    const input = document.getElementById('operating-region-input');
    const display = document.getElementById('operating-region');
    
    if (input.value.trim()) {
        display.textContent = input.value.trim();
        localStorage.setItem('operatingRegion', input.value.trim());
        input.value = '';
        alert('Região de atuação atualizada com sucesso!');
    }
}

function updateCreci() {
    const input = document.getElementById('creci-input');
    const display = document.getElementById('creci-number');
    
    if (input.value.trim()) {
        display.textContent = input.value.trim();
        localStorage.setItem('creciNumber', input.value.trim());
        input.value = '';
        alert('Número CRECI atualizado com sucesso!');
    }
}

// Form handling
function initializeForms() {
    const contactForm = document.getElementById('contact-form');
    const scheduleForm = document.getElementById('schedule-form');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactForm();
    });

    scheduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleScheduleForm();
    });
}

function handleContactForm() {
    // In a real application, this would send data to a server
    alert('Obrigado pela sua mensagem! Entraremos em contato em breve.');
    document.getElementById('contact-form').reset();
}

function handleScheduleForm() {
    const name = document.getElementById('visitor-name').value;
    const email = document.getElementById('visitor-email').value;
    const phone = document.getElementById('visitor-phone').value;
    const date = document.getElementById('visit-date').value;
    const property = document.getElementById('selected-property').value;

    // In a real application, this would integrate with Google Calendar API
    alert(`Visita agendada com sucesso!\n\nDetalhes:\nNome: ${name}\nEmail: ${email}\nTelefone: ${phone}\nData: ${date}\nPropriedade: ${property}\n\nEntraremos em contato para confirmar o agendamento.`);
    
    document.getElementById('schedule-form').reset();
    document.getElementById('schedule-modal').style.display = 'none';
}

// Load sample properties for demonstration
function loadSampleProperties() {
    if (properties.length === 0) {
        const sampleProperties = [
            {
                name: "Cobertura de Luxo Marina Bay",
                address: "Marina Bay, Bairro Premium",
                price: "R$ 12.500.000",
                description: "Deslumbrante cobertura com vista panorâmica da cidade, apresentando 4 quartos, 3 banheiros, cozinha gourmet e terraço privativo. Acabamentos premium em toda parte, incluindo pisos de mármore, armários personalizados e tecnologia residencial inteligente.",
                images: [
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop"
                ],
                pdfs: [
                    { url: "https://example.com/memorial-descritivo.pdf", name: "Memorial Descritivo" },
                    { url: "https://example.com/planta-baixa.pdf", name: "Planta Baixa" }
                ],
                video: "",
                status: "available"
            },
            {
                name: "Villa Executiva Sunset Hills",
                address: "Sunset Hills, Bairro de Elite",
                price: "R$ 9.000.000",
                description: "Magnífica villa com 5 quartos, 4 banheiros, piscina e jardins paisagísticos. Características incluem adega, home theater e garagem para três carros em um prestigioso condomínio fechado.",
                images: [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop"
                ],
                pdfs: [
                    { url: "https://example.com/prospecto-villa.pdf", name: "Prospecto da Villa" }
                ],
                video: "",
                status: "available"
            },
            {
                name: "Loft Moderno Centro",
                address: "Centro Financeiro",
                price: "R$ 4.750.000",
                description: "Loft contemporâneo em localização privilegiada no centro. Planta aberta com 2 quartos, 2 banheiros, paredes de tijolo aparente, pé-direito alto e janelas do chão ao teto com vista da cidade.",
                images: [
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop"
                ],
                pdfs: [],
                video: "",
                status: "reserved"
            }
        ];

        properties = sampleProperties;
        saveProperties();
        displayProperties();
        updateFeaturedProperties();
        updateSchedulePropertyOptions();
    }

    // Load saved settings
    const savedRegion = localStorage.getItem('operatingRegion');
    const savedCreci = localStorage.getItem('creciNumber');
    
    if (savedRegion) {
        document.getElementById('operating-region').textContent = savedRegion;
    }
    
    if (savedCreci) {
        document.getElementById('creci-number').textContent = savedCreci;
    }
}

// PDF Viewer functions
let currentPDFUrl = '';

function openPDFViewer(pdfUrl, pdfName) {
    currentPDFUrl = pdfUrl;
    const modal = document.getElementById('pdf-viewer-modal');
    const iframe = document.getElementById('pdf-iframe');
    const title = document.getElementById('pdf-title');
    const errorDiv = document.getElementById('pdf-error');
    
    title.textContent = pdfName || 'Visualizar Documento';
    
    // Usar Google Drive Viewer para melhor compatibilidade
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    
    iframe.src = viewerUrl;
    iframe.style.display = 'block';
    errorDiv.style.display = 'none';
    
    // Detectar erro de carregamento
    iframe.onload = function() {
        // Verificar se o iframe carregou corretamente
        try {
            if (iframe.contentDocument === null) {
                showPDFError();
            }
        } catch (e) {
            // Cross-origin error é esperado, mas significa que carregou
        }
    };
    
    iframe.onerror = function() {
        showPDFError();
    };
    
    // Timeout para detectar falhas de carregamento
    setTimeout(() => {
        if (iframe.src && iframe.style.display === 'block') {
            try {
                if (iframe.contentWindow.location.href === 'about:blank') {
                    showPDFError();
                }
            } catch (e) {
                // Cross-origin error é esperado
            }
        }
    }, 5000);
    
    modal.style.display = 'block';
}

function showPDFError() {
    const iframe = document.getElementById('pdf-iframe');
    const errorDiv = document.getElementById('pdf-error');
    
    iframe.style.display = 'none';
    errorDiv.style.display = 'block';
}

function downloadPDF() {
    if (currentPDFUrl) {
        const link = document.createElement('a');
        link.href = currentPDFUrl;
        link.download = '';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function openPDFNewTab() {
    if (currentPDFUrl) {
        window.open(currentPDFUrl, '_blank');
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.property-card, .about-content, .contact-content');
    animateElements.forEach(el => observer.observe(el));
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
