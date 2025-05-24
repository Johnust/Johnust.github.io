/**
 * Main JavaScript file for ZhiyanTrack website
 * Handles navigation, data loading, and interactive features
 */

// Global state management
const AppState = {
    isLoading: false,
    data: {
        features: null,
        techAdvantages: null,
        useCases: null,
        serviceModel: null
    }
};

// Utility functions
const Utils = {
    // Debounce function for performance optimization
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
    },

    // Smooth scroll to section
    smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    // Show loading state
    showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="loading-placeholder h-32 rounded-lg mb-4"></div>
                <div class="loading-placeholder h-4 rounded mb-2"></div>
                <div class="loading-placeholder h-4 rounded w-3/4"></div>
            `;
        }
    }
};

// Data loading functions
const DataLoader = {
    async loadJSON(filepath) {
        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filepath}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading data from ${filepath}:`, error);
            return null;
        }
    },

    async loadAllData() {
        AppState.isLoading = true;
        
        const loadPromises = [
            this.loadJSON('data/product-features.json'),
            this.loadJSON('data/tech-advantages.json'),
            this.loadJSON('data/use-cases.json'),
            this.loadJSON('data/service-model.json')
        ];

        try {
            const [features, techAdvantages, useCases, serviceModel] = await Promise.all(loadPromises);
            
            AppState.data.features = features;
            AppState.data.techAdvantages = techAdvantages;
            AppState.data.useCases = useCases;
            AppState.data.serviceModel = serviceModel;
            
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        } finally {
            AppState.isLoading = false;
        }
    }
};

// UI component renderers
const UIComponents = {
    renderFeatureCard(feature) {
        return `
            <div class="feature-card bg-white rounded-lg p-6 shadow-md">
                <div class="text-4xl mb-4">${feature.icon}</div>
                <h3 class="text-xl font-bold text-tech-blue mb-3">${feature.title}</h3>
                <p class="text-gray-700 mb-4">${feature.description}</p>
                <div class="text-sm text-accent-cyan font-semibold">
                    价值: ${feature.value}
                </div>
            </div>
        `;
    },

    renderTechCard(tech) {
        return `
            <div class="tech-card bg-white rounded-lg p-6 shadow-md text-center">
                <div class="text-3xl mb-3">${tech.icon}</div>
                <h4 class="text-lg font-bold text-tech-blue mb-2">${tech.title}</h4>
                <p class="text-sm text-gray-600">${tech.description}</p>
            </div>
        `;
    },

    renderUseCaseCard(useCase) {
        return `
            <div class="bg-white rounded-lg p-6 shadow-md">
                <div class="text-4xl mb-4">${useCase.icon}</div>
                <h3 class="text-xl font-bold text-tech-blue mb-3">${useCase.scenario}</h3>
                <div class="space-y-3">
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-1">痛点:</h4>
                        <p class="text-gray-600 text-sm">${useCase.painPoint}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-1">解决方案:</h4>
                        <p class="text-gray-600 text-sm">${useCase.solution}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-accent-cyan mb-1">预期收益:</h4>
                        <p class="text-gray-600 text-sm">${useCase.benefit}</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderServiceTable(serviceModel) {
        if (!serviceModel || !serviceModel.deliveryItems) {
            return '<p class="text-center py-8 text-gray-600">服务模式数据加载中...</p>';
        }

        const tableRows = serviceModel.deliveryItems.map(item => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-semibold text-tech-blue">${item.reportType}</td>
                <td class="px-6 py-4">${item.frequency}</td>
                <td class="px-6 py-4">${item.coreContent}</td>
                <td class="px-6 py-4">${item.value}</td>
            </tr>
        `).join('');

        return `
            <table class="service-table w-full">
                <thead>
                    <tr class="bg-tech-blue text-white">
                        <th class="px-6 py-4 text-left">报告类型</th>
                        <th class="px-6 py-4 text-left">频率</th>
                        <th class="px-6 py-4 text-left">核心内容</th>
                        <th class="px-6 py-4 text-left">价值</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    }
};

// Navigation functionality
const Navigation = {
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    },

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    },

    setupSmoothScrolling() {
        // Handle navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                Utils.smoothScrollTo(targetId);
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });
    },

    setupActiveNavigation() {
        // Highlight active section in navigation
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        link.classList.remove('text-white', 'bg-white/10');
                        link.classList.add('text-gray-300');
                    });

                    const activeLink = document.querySelector(`nav a[href="#${currentId}"]`);
                    if (activeLink) {
                        activeLink.classList.remove('text-gray-300');
                        activeLink.classList.add('text-white', 'bg-white/10');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }
};

// Page initialization and content loading
const PageManager = {
    async init() {
        console.log('Initializing ZhiyanTrack website...');
        
        // Initialize navigation
        Navigation.init();
        
        // Load and render data
        await this.loadAndRenderContent();
        
        // Setup responsive features
        this.setupResponsiveFeatures();
        
        // Add scroll animations
        this.setupScrollAnimations();
        
        console.log('Website initialization complete');
    },

    async loadAndRenderContent() {
        // Show loading states
        const containers = {
            features: document.getElementById('features-grid'),
            tech: document.getElementById('tech-preview'),
            useCases: document.getElementById('use-cases-grid'),
            service: document.getElementById('service-table-container')
        };

        Object.values(containers).forEach(container => {
            if (container) Utils.showLoading(container);
        });

        // Load data
        const success = await DataLoader.loadAllData();
        
        if (success) {
            this.renderFeatures();
            this.renderTechnologyPreview();
            this.renderUseCases();
            this.renderServiceModel();
        } else {
            this.renderFallbackContent();
        }
    },

    renderFeatures() {
        const container = document.getElementById('features-grid');
        const features = AppState.data.features;
        
        if (container && features && features.features) {
            const featuresHTML = features.features.slice(0, 6).map(feature => 
                UIComponents.renderFeatureCard(feature)
            ).join('');
            
            container.innerHTML = featuresHTML;
            
            // Add staggered animation
            container.querySelectorAll('.feature-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
            });
        }
    },

    renderTechnologyPreview() {
        const container = document.getElementById('tech-preview');
        const techData = AppState.data.techAdvantages;
        
        if (container && techData && techData.technologies) {
            const techHTML = techData.technologies.map(tech => 
                UIComponents.renderTechCard(tech)
            ).join('');
            
            container.innerHTML = techHTML;
        }
    },

    renderUseCases() {
        const container = document.getElementById('use-cases-grid');
        const useCasesData = AppState.data.useCases;
        
        if (container && useCasesData && useCasesData.scenarios) {
            const useCasesHTML = useCasesData.scenarios.slice(0, 3).map(useCase => 
                UIComponents.renderUseCaseCard(useCase)
            ).join('');
            
            container.innerHTML = useCasesHTML;
        }
    },

    renderServiceModel() {
        const container = document.getElementById('service-table-container');
        const serviceData = AppState.data.serviceModel;
        
        if (container) {
            container.innerHTML = UIComponents.renderServiceTable(serviceData);
        }
    },

    renderFallbackContent() {
        console.warn('Rendering fallback content due to data loading failure');
        
        // Render basic features
        const featuresContainer = document.getElementById('features-grid');
        if (featuresContainer) {
            featuresContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-600">功能介绍将在系统升级后呈现，敬请期待。</p>
                </div>
            `;
        }
    },

    setupResponsiveFeatures() {
        // Handle window resize events
        const resizeHandler = Utils.debounce(() => {
            // Add responsive adjustments if needed
            console.log('Window resized');
        }, 250);
        
        window.addEventListener('resize', resizeHandler);
    },

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe sections for animation
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
});

// Handle external links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('https://f.wps.cn/')) {
        // Analytics or tracking can be added here
        console.log('External form link clicked');
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        Utils,
        DataLoader,
        UIComponents,
        Navigation,
        PageManager
    };
}



