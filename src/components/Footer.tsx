import darkBgLogo from "../assets/logos/darkBgLogo.png";
import facebookIcon from "../assets/icons/facebookIcon.png";
import instagramIcon from "../assets/icons/instagramIcon.png";
import linkedinIcon from "../assets/icons/linkedinIcon.png";
import youtubeIcon from "../assets/icons/youtubeIcon.png";
import h4ILogo from "../assets/icons/h4ILogo.png";
import BGPatternDark from "../assets/patterns/BGPatternDark.svg";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="w-full h-[280px] bg-camp-primary">
      <div className="flex pb-[34px] justify-around items-end h-full flex-wrap font-lato">
        <div className="flex flex-col w-[208px] gap-[24px]">
          <img src={darkBgLogo.src} className="h-[148px]"></img>
          <div className="flex flex-row gap-[12px]">
            <Link href="https://www.facebook.com/campstarfish/">
              <img src={facebookIcon.src} className="h-[32px]"></img>
            </Link>
            <Link href="https://www.instagram.com/campstarfishrindge">
              <img src={instagramIcon.src} className="h-[32px]"></img>
            </Link>
            <Link href="https://www.linkedin.com/company/camp-starfish/">
              <img src={linkedinIcon.src} className="h-[32px]"></img>
            </Link>
            <Link href="https://www.youtube.com/@CampStarfish">
              <img src={youtubeIcon.src} className="h-[32px]"></img>
            </Link>
          </div>
        </div>
        <div className="flex flex-col w-[208px]">
          <p className="mb-[24px] font-bold">Year-Round Office</p>
          <p className="mb-[24px]">
            873 Main St. Suite 1<br></br>Ashby, MA 01431
          </p>
          <p>
            <span className="font-bold">Phone: </span>978-637-2617
          </p>
          <p>
            <span className="font-bold">Fax: </span>978-849-5004
          </p>
          <p>
            <span className="font-bold">Email: </span>info@campstarfish.org
          </p>
        </div>
        <div className="flex flex-col w-[208px]">
          <p className="mb-[24px] font-bold">Summer Office</p>
          <p className="mb-[24px]">
            12 Camp Monomonac Rd.,<br></br>Rindge, NH 03461
          </p>
          <p>
            <span className="font-bold">Phone: </span>603-899-9590
          </p>
          <p>
            <span className="font-bold">Fax: </span>978-849-5004
          </p>
          <p>
            <span className="font-bold">Email: </span>info@campstarfish.org
          </p>
        </div>
        <div className="flex flex-row justify-center items-end gap-[12px]">
          <Link href="https://hack4impact.org/" target="_blank">
            <p>
              Built By<br></br>Hack4Impact-UMD
            </p>
          </Link>
          <Link href="https://hack4impact.org/" target="_blank">
            {" "}
            <img src={h4ILogo.src} className="h-[32px]"></img>
          </Link>
        </div>
      </div>
      <img src={BGPatternDark.src} className="w-full absolute"></img>
    </div>
  );
}
