import { Link } from "react-router-dom";
import aboutTeamSrc from "../../../assets/images_dir/about7.png";

export default function AboutJoinTeamSection() {
  return (
    <section className="bg-white px-4 py-8 pb-20 sm:pb-32 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <div className="overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#0A56A6] text-white flex flex-col lg:flex-row relative">
          <div className="absolute top-[-50px] left-[-30px] w-[180px] h-[180px] rounded-full border-[30px] border-white/10 z-0" />
          <div className="absolute bottom-0 left-[20%] w-[80px] h-[40px] rounded-t-full bg-white/10 z-0" />
          <div className="absolute bottom-[-20px] left-[10%] w-[120px] h-[120px] bg-white/5 rotate-45 z-0" />

          <div className="px-6 sm:px-10 py-10 sm:py-16 lg:w-[45%] flex flex-col justify-center relative z-10 lg:pl-16">
            <h2 className="font-display text-[28px] font-bold sm:text-[46px] leading-[1.1] drop-shadow-sm">Join The Team Driving Climate Impact</h2>
            <p className="mt-6 text-[17px] text-white/85 leading-relaxed">
              Our technology and our people create software products that accelerate the world's transition to a sustainable economy. Come join us!
            </p>
            <Link to="/contact" className="mt-10 self-start bg-white text-[#0A56A6] hover:bg-[#F4F6F8] rounded-full px-8 py-3.5 font-semibold flex items-center gap-3 transition-colors shadow-md">
              <span>View Open Roles</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>

          <div className="lg:w-[55%] relative overflow-hidden min-h-[300px] group">
            <img src={aboutTeamSrc} alt="Carbon Crunch Team" className="h-full w-full object-cover lg:rounded-tl-[64px] grayscale transition-all duration-700 group-hover:grayscale-0" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
