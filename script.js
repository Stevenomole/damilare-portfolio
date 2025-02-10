document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  
    // Intersection Observer for highlighting the active nav link
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
  
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Remove "active" from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Highlight the link that points to this section
            const currentId = entry.target.getAttribute('id');
            const newActive = document.querySelector(`.nav-links a[href="#${currentId}"]`);
            if (newActive) {
              newActive.classList.add('active');
            }
          }
        });
      },
      { threshold: 0.3 }
    );
  
    sections.forEach(section => observer.observe(section));
  
    // Project image sliders
    function initializeSliders() {
      document.querySelectorAll('.slider').forEach(slider => {
        const slides = slider.querySelectorAll('.slides img');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        const dotsContainer = slider.querySelector('.slider-dots');
        let currentSlide = 0;
  
        // Create dots
        slides.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add('slider-dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => goToSlide(index));
          dotsContainer.appendChild(dot);
        });
  
        // Ensure first slide is visible
        slides[0].classList.add('active');
  
        // Event listeners for arrow buttons
        prevBtn.addEventListener('click', () => {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          updateSlider();
        });
  
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
  
          const allDots = dotsContainer.querySelectorAll('.slider-dot');
          allDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
          });
        }
      });
    }
  
    initializeSliders();
  });
  