import { Carousel } from "antd";


export default function HeroSection() {

  const heroSlides = [
    {
      title: "Worldwide Music Concert",
      tagline: "Explore, Book, Enjoy - Your Event Journey Begins Here"
    },
    {
      title: "Global Party Events",
      tagline: "Explore, Book, Enjoy - Your Event Journey Begins Here"
    },
    {
      title: "Celebration of Marriage",
      tagline: "Explore, Book, Enjoy - Your Event Journey Begins Here"
    },
    {
      title: "Crafting Magical Birthdays",
      tagline: "Explore, Book, Enjoy - Your Event Journey Begins Here"
    },
    {
      title: "Let's Explore Together",
      tagline: "Explore, Book, Enjoy - Your Event Journey Begins Here"
    }
  ];

  return (
    <div id="hero-section">
      <Carousel 
        effect="fade" 
        autoplay 
        dotPosition="right"
        autoplaySpeed={3000}
        speed={800}
      >
        {heroSlides.map((slide, index) => (
          <div key={index}>
            <div className="container">
              <div className="row">
                <div className="col">
                  <h1>{slide.title}</h1>
                  <h4>{slide.tagline}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}