document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const menuHandle = document.querySelector('.menu-handle');
    const navWrapper = document.querySelector('.nav-wrapper');
    const mainContent = document.querySelector('main');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Create AI particles (decorative background)
    const particlesContainer = document.querySelector('.ai-particles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            // Random positioning for each particle
            particle.style.setProperty('--x', Math.random());
            particle.style.setProperty('--y', Math.random());
            particlesContainer.appendChild(particle);
        }
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for section animations
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                updateNavigation(entry.target.id);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Update active link in sidebar when a section becomes visible
    function updateNavigation(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Mobile menu toggle (creates the hamburger button)
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span class="material-icons">menu</span>';
    navWrapper.appendChild(menuToggle);

    menuToggle.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-wrapper')) {
            document.querySelector('.nav-links').classList.remove('active');
        }
    });

    // Show selected section and hide others
    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.display = 'none';
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => {
                targetSection.style.opacity = '1';
                targetSection.classList.add('active');
            }, 50);
        }
    }

    // Highlight the clicked navigation link
    function updateActiveLink(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    // Handle side menu collapse (desktop)
    if (menuHandle) {
        menuHandle.addEventListener('click', () => {
            navWrapper.classList.toggle('collapsed');
            const isCollapsed = navWrapper.classList.contains('collapsed');
            mainContent.style.marginLeft = isCollapsed ? '50px' : '250px';

            const arrow = menuHandle.querySelector('.material-icons');
            if (arrow) {
                arrow.textContent = isCollapsed ? 'chevron_right' : 'chevron_left';
            }
        });
    }

    // Handle navigation click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            updateActiveLink(link);
            showSection(targetId);
        });
    });

    // Show initial section based on URL hash or default
    const initialSection = window.location.hash.substring(1) || 'home';
    const initialLink = document.querySelector(`a[href="#${initialSection}"]`);
    if (initialLink) {
        updateActiveLink(initialLink);
        showSection(initialSection);
    }

    // Automatically collapse sidebar on mobile
    function handleMobileLayout() {
        if (window.innerWidth <= 768) {
            navWrapper.classList.add('collapsed');
            mainContent.style.marginLeft = '50px';
        } else {
            navWrapper.classList.remove('collapsed');
            mainContent.style.marginLeft = '250px';
        }
    }

    // Perform initial check and set up event for resizing
    handleMobileLayout();
    window.addEventListener('resize', handleMobileLayout);

    // GitHub Repository Embed
    function loadGitHubRepos() {
        const embeds = document.querySelectorAll('.github-embed');
        embeds.forEach(embed => {
            const repo = embed.getAttribute('data-repo');
            if (repo) {
                embed.innerHTML = `
                    <div class="github-card">
                        <script src="https://gist.github.com/${repo}.js"></script>
                    </div>
                `;
            }
        });
    }

    function loadRepoContents(username, repoName, path, embed) {
        const fileList = embed.querySelector('.file-list');
        const breadcrumb = embed.querySelector('.explorer-breadcrumb');
        
        // Update breadcrumb
        const parts = path.split('/').filter(p => p);
        breadcrumb.innerHTML = `
            <span class="breadcrumb-item" data-path="">root</span>
            ${parts.map((part, i) => `
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item" data-path="${parts.slice(0, i + 1).join('/')}">${part}</span>
            `).join('')}
        `;

        // Fetch directory contents
        fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`)
            .then(response => response.json())
            .then(contents => {
                // Sort contents: directories first, then files
                contents.sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'dir' ? -1 : 1;
                });

                fileList.innerHTML = contents.map(item => `
                    <div class="file-item ${item.type}" data-path="${item.path}" data-type="${item.type}">
                        <i class="material-icons">${item.type === 'dir' ? 'folder' : 'description'}</i>
                        <span>${item.name}</span>
                    </div>
                `).join('');

                // Add click handlers
                fileList.querySelectorAll('.file-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const itemPath = item.getAttribute('data-path');
                        const itemType = item.getAttribute('data-type');
                        
                        if (itemType === 'dir') {
                            loadRepoContents(username, repoName, itemPath, embed);
                        } else {
                            loadFileContent(username, repoName, itemPath, embed);
                        }
                    });
                });

                // Add breadcrumb click handlers
                breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const itemPath = item.getAttribute('data-path');
                        loadRepoContents(username, repoName, itemPath, embed);
                    });
                });
            });
    }

    function loadFileContent(username, repoName, path, embed) {
        const filePreview = embed.querySelector('.file-preview');
        
        fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`)
            .then(response => response.json())
            .then(data => {
                const content = atob(data.content);
                filePreview.innerHTML = `
                    <div class="file-preview-header">
                        <h4>${path.split('/').pop()}</h4>
                    </div>
                    <pre class="file-content"><code>${escapeHtml(content)}</code></pre>
                `;
            });
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Load repos when page loads
    document.addEventListener('DOMContentLoaded', loadGitHubRepos);

    function initializeSliders() {
        document.querySelectorAll('.slider').forEach(slider => {
            const slides = slider.querySelectorAll('.slides img');
            const prevBtn = slider.querySelector('.prev');
            const nextBtn = slider.querySelector('.next');
            const dots = slider.querySelector('.slider-dots');
            let currentSlide = 0;

            // Create dots
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dots.appendChild(dot);
            });

            // Show first slide
            slides[0].classList.add('active');

            // Previous button click
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateSlider();
            });

            // Next button click
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slides.length;
                updateSlider();
            });

            function goToSlide(index) {
                currentSlide = index;
                updateSlider();
            }

            function updateSlider() {
                slides.forEach(slide => slide.classList.remove('active'));
                slides[currentSlide].classList.add('active');
                
                dots.querySelectorAll('.slider-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
            }
        });
    }

    initializeSliders();
});
