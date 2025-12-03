import darkBgLogo from "../assets/logos/darkBgLogo.png";
import facebookIcon from "../assets/icons/facebookIcon.png";
import instagramIcon from "../assets/icons/instagramIcon.png";
import linkedinIcon from "../assets/icons/linkedinIcon.png";
import youtubeIcon from "../assets/icons/youtubeIcon.png";
import h4ILogo from "../assets/icons/h4ILogo.png";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <div className="w-full h-[280px] bg-blue-8 text-white">
      <div className="flex pb-[34px] justify-around items-end h-full flex-wrap font-lato">
        <div className="flex flex-col w-[208px] gap-[24px]">
          <Image src={darkBgLogo.src} className="h-[148px]" alt="Logo" width={222} height={214.37} />
          <div className="flex flex-row gap-[12px]">
            <Link href="https://www.facebook.com/campstarfish/">
              <Image src={facebookIcon.src} className="h-[32px]" alt="Facebook" width={32} height={32} />
            </Link>
            <Link href="https://www.instagram.com/campstarfishrindge">
              <Image src={instagramIcon.src} className="h-[32px]" alt="Instagram" width={32} height={32} />
            </Link>
            <Link href="https://www.linkedin.com/company/camp-starfish/">
              <Image src={linkedinIcon.src} className="h-[32px]" alt="LinkedIn" width={32} height={32} />
            </Link>
            <Link href="https://www.youtube.com/@CampStarfish">
              <Image src={youtubeIcon.src} className="h-[32px]" alt="YouTube" width={32} height={32} />
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
            <span className="font-bold">Email: </span>
            <a
              href={`mailto:${"info@campstarfish.org"}`}
              className="hover:underline"
            >
              info@campstarfish.org
            </a>
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
            <span className="font-bold">Email: </span>
            <a
              href={`mailto:${"info@campstarfish.org"}`}
              className="hover:underline"
            >
              info@campstarfish.org
            </a>
          </p>
        </div>
        <Link href="https://umd.hack4impact.org/ourwork/camp-starfish" target="_blank">
          <div className="flex flex-row justify-center items-end gap-[12px]">
            <p>
              Built By<br></br>Hack4Impact-UMD
            </p>{" "}
            <Image src={h4ILogo.src} alt="Hack4Impact-UMD Logo" width={40} height={40} />
          </div>
        </Link>
      </div>
    </div>
  );
}
