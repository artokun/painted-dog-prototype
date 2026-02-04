import Link from "next/link";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Leva } from "leva";
import { bookStore } from "../store/bookStore";
import { BackIcon } from "./icons/Back";
import { ThreeLink } from "./ThreeLink";
import { useMediaQuery } from "usehooks-ts";
import { globalStore } from "../store/globalStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { animated, useSpring } from "@react-spring/web";
import { CartButton } from "./ecommerce/CartButton";
import { authStore, logout } from "@/app/store/authStore";

gsap.registerPlugin(ScrollTrigger);

const MenuButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const underlineSpring = useSpring({
    width: isPressed ? 1 : isHovered ? 1 : -0.0001,
    x: isPressed ? 100 : 0,
    opacity: isHovered && !isPressed ? 1 : 0,
    config: { tension: 400, friction: 25, mass: 1 },
  });

  return (
    <button
      onClick={() => (globalStore.isMenuOpen = !globalStore.isMenuOpen)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      className="appearance-none cursor-pointer relative inline-block overflow-hidden pb-1"
    >
      Menu
      <animated.span
        className="absolute left-0 h-0.5 bg-black origin-left text-[0px]"
        style={{
          bottom: "5px",
          width: underlineSpring.width.to((width) => `${width * 100}%`),
          opacity: underlineSpring.opacity
            .to([0, 1], [0, 10])
            .to((opacity) => `${Math.min(opacity, 1)}`),
          transform: underlineSpring.x.to((x) => `translateX(${x}%)`),
        }}
      />
    </button>
  );
};

export const Header = () => {
  const { view } = useSnapshot(filterStore);
  const { isRendered, focusedBookId } = useSnapshot(bookStore);
  const { currentRoute, overlayScrollPosition } = useSnapshot(globalStore);
  const isGridMode = view === FilterView.Grid;
  const isBookPage = currentRoute.startsWith("/books/");
  const isHomepage = currentRoute === "/";
  const isContactPage = currentRoute === "/contact";
  const isLegalPage = currentRoute === "/legal";
  const isLoginPage = currentRoute === "/login";
  const isOverlayPage = isContactPage || isLegalPage || isLoginPage;
  const isBookFocused = focusedBookId !== null;
  const [showHeader, setShowHeader] = useState(true);
  const [showBackButton, setShowBackButton] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [levaLoaded, setLevaLoaded] = useState(false);
  const auth = useSnapshot(authStore);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileBookPageContentRef = useRef<HTMLDivElement>(null);

  // GSAP refs
  const logoRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);

  const [shouldStartCollapsed, setShouldStartCollapsed] = useState(
    currentRoute !== "/"
  );

  useEffect(() => {
    setShouldStartCollapsed(currentRoute !== "/");
  }, [currentRoute]);

  useEffect(() => {
    if (!isRendered) return;
    scrollContainerRef.current = document.getElementById(
      "scroll-el"
    ) as HTMLDivElement;
    mobileBookPageContentRef.current = document.getElementById(
      "mobile-book-page-content"
    ) as HTMLDivElement;

    // TODO: remove this after accelerated launch
    setTimeout(() => {
      setLevaLoaded(true);
    }, 1000);

    // hide header after 100px of scroll from top
    const handleScroll = () => {
      // if (scrollContainerRef.current) {
      //   setShowHeader(scrollContainerRef.current.scrollTop <= 300);
      // }
      if (mobileBookPageContentRef.current) {
        setShowBackButton(mobileBookPageContentRef.current.scrollTop <= 300);
      }
    };

    // scrollContainerRef.current?.addEventListener("scroll", handleScroll);
    mobileBookPageContentRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      // scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
      mobileBookPageContentRef.current?.removeEventListener(
        "scroll",
        handleScroll
      );
      setShowBackButton(true);
      // setShowHeader(true);
    };
  }, [isRendered, isMobile, isBookPage, isBookFocused]);

  // Hide header when overlay pages are scrolled past 50px
  // useEffect(() => {
  //   if (isOverlayPage) {
  //     setShowHeader(overlayScrollPosition <= 50);
  //   }
  // }, [isOverlayPage, overlayScrollPosition]);

  // GSAP Scroll Animation
  useEffect(() => {
    if (!isRendered || !isHomepage) return;

    let ctx: gsap.Context | null = null;

    const timeoutId = setTimeout(() => {
      let activeScrollContainer: HTMLDivElement | null = null;

      if (scrollContainerRef.current) {
        activeScrollContainer = scrollContainerRef.current;
      }

      if (!activeScrollContainer) return;

      ctx = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: activeScrollContainer,
            scroller: activeScrollContainer,
            start: "top top",
            end: "+=300",
            scrub: 1,
          },
        });

        // Animate logo scale down
        timeline.to(
          logoRef.current,
          {
            scale: 0.2,
            duration: 1,
            y: -90,
          },
          0
        );

        timeline.to(
          newsRef.current,
          {
            x: 210,
            duration: 1,
            y: 0,
          },
          0
        );

        timeline.to(
          menuRef.current,
          {
            x: -120,
            duration: 1,
            y: 0,
          },
          0
        );

        timeline.to(
          reviewsRef.current,
          {
            x: 60,
            opacity: 1,
            duration: 1,
            y: 0,
          },
          0
        );

        timeline.to(
          separatorRef.current,
          {
            x: -116,
            opacity: 1,
            duration: 1,
            y: -1,
          },
          0
        );

        // Animate Newsletter moving up and to the right
        timeline.to(
          newsletterRef.current,
          {
            x: -133,
            y: 0,
            duration: 1,
          },
          0
        );

        // Animate Login/SignUp moving up and to the left
        timeline.to(
          loginRef.current,
          {
            x: 130,
            y: 0,
            duration: 1,
          },
          0
        );
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [isRendered, isHomepage]);

  const handleBackButtonClick = () => {
    bookStore.focusedBookId = null;
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full flex items-center justify-between z-20 font-medium pointer-events-auto gap-4 h-20 px-4 md:px-20"
      )}
    >
      <div className="flex-1 flex text-black">
        {!isBookFocused && (
          <>
            <Link className="flex w-40 md:hidden" href="/">
              <Image
                className="object-contain w-[190px]"
                src="/logo-dog-inline.png"
                alt="Logo"
                height={90}
                width={190}
              />
            </Link>
            <div className="hidden md:flex">
              <div
                style={
                  shouldStartCollapsed
                    ? { transform: "translateX(210px)" }
                    : undefined
                }
                ref={newsRef}
                className="hidden md:flex pointer-events-auto"
              >
                <ThreeLink animatedUnderline href="/contact">
                  News
                </ThreeLink>
              </div>

              <div
                style={
                  shouldStartCollapsed
                    ? { opacity: 1, transform: "translateX(60px)" }
                    : { opacity: 0 }
                }
                ref={reviewsRef}
                className="pointer-events-auto"
              >
                <span>•</span>
                <ThreeLink animatedUnderline className="px-2" href="/contact">
                  Reviews
                </ThreeLink>
                <span>•</span>
              </div>

              <div
                style={
                  shouldStartCollapsed
                    ? { transform: "translateX(-133px)" }
                    : { transform: "translateX(-143px) translateY(220px)" }
                }
                ref={newsletterRef}
                className="hidden md:flex pointer-events-auto"
              >
                <ThreeLink animatedUnderline href="/contact">
                  Newsletter
                </ThreeLink>
              </div>
            </div>
          </>
        )}

        <button
          className={cn(
            "text-black flex items-center gap-2 cursor-pointer transition-all duration-300 delay-0 opacity-0 translate-x-5 pointer-events-none group",
            isBookFocused &&
              showBackButton &&
              showHeader &&
              "opacity-100 translate-x-0 delay-400 pointer-events-auto"
          )}
          onClick={handleBackButtonClick}
        >
          <span className="relative w-6 h-[18px] [svg]:w-full [svg]:h-full group-hover:animate-[arrow-bounce_1s_ease-in-out_infinite]">
            <BackIcon />
          </span>
          <span className="text-[19px] font-medium">
            back to {isGridMode ? "grid" : "stack"}
          </span>
        </button>
      </div>
      {!isBookFocused && !isMobile && (
        <div
          style={
            shouldStartCollapsed
              ? { transform: "translate(0px, -90px) scale(0.2, 0.2)" }
              : undefined
          }
          ref={logoRef}
          className={cn(
            "fixed top-0 w-[90%] block justify-center whitespace-nowrap items-center text-center font-fields  font-semibold transition-opacity duration-300",
            !showHeader &&
              (isHomepage || isOverlayPage) &&
              "opacity-0 pointer-events-none"
          )}
        >
          <Link href="/">
            <Image
              className="object-cover w-[140px]  md:w-full"
              src="/logo-dog-inline.png"
              alt="Logo"
              height={6120}
              width={1340}
            />
          </Link>
        </div>
      )}
      <div
        className={cn(
          "gap-2 items-center flex-1 flex justify-end opacity-100 transition-opacity duration-300 delay-0 pointer-events-auto",
          isBookFocused && "opacity-0 delay-600 pointer-events-none"
        )}
      >
        <div
          style={
            shouldStartCollapsed
              ? { transform: "translateX(143px)" }
              : { transform: "translateX(143px) translateY(220px)" }
          }
          ref={loginRef}
          className="hidden md:flex gap-2 items-center text-black"
        >
          {/* <ThreeLink animatedUnderline href="/contact">
            Login/SignUp
          </ThreeLink> */}

          {/* <button onClick={logout}>Test Logout</button> */}
          {auth?.isLoggedIn ? (
            <>
              <span>Hello, {auth.user?.firstName}</span>
              <button className="cursor-pointer" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <ThreeLink animatedUnderline href="/login">
              Login/SignUp
            </ThreeLink>
          )}
        </div>
        <div
          style={
            shouldStartCollapsed
              ? { transform: "translateX(-120px)" }
              : { transform: "translateX(20px)" }
          }
          ref={menuRef}
          className="hidden md:flex gap-2 items-center text-black"
        >
          <CartButton />
          <MenuButton />
        </div>
        <div
          style={
            shouldStartCollapsed
              ? { opacity: 1, transform: "translateX(-106px) translateY(-1px)" }
              : { opacity: 0 }
          }
          className="text-black"
          ref={separatorRef}
        >
          <span>•</span>
        </div>
        <div className="md:hidden flex gap-2 items-center text-black">
          <MenuButton />
        </div>
      </div>
      <div className="hidden">
        <Leva
          collapsed={{ collapsed: isCollapsed, onChange: setIsCollapsed }}
          isRoot
        />
      </div>
    </div>
  );
};
