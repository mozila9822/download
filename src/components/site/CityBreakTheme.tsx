"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LinkSpec = { href: string; label: string };

export function HeroBanner({
  title,
  subtitle,
  imageUrl,
  primaryLink,
  secondaryLink,
  heightClass = "h-[45vh] md:h-[55vh]",
  fullBleed = false,
  offsetHeader = true,
  icon,
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  primaryLink?: LinkSpec;
  secondaryLink?: LinkSpec;
  heightClass?: string;
  fullBleed?: boolean;
  offsetHeader?: boolean;
  icon?: React.ReactNode;
}) {
  const topOffset = fullBleed && offsetHeader ? "-mt-16" : "";
  const wrapperClass = fullBleed
    ? `relative overflow-hidden w-full ${topOffset} ${heightClass}`
    : `relative overflow-hidden rounded-2xl ${heightClass}`;

  return (
    <section
      className={wrapperClass}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <div className="max-w-6xl">
          <div className="flex items-center justify-center gap-3">
            {icon}
            <h1 className="text-4xl md:text-6xl font-bold text-white">{title}</h1>
          </div>
          {subtitle && (
            <p className="mt-3 md:mt-4 text-white/90 md:text-lg">{subtitle}</p>
          )}
          {(primaryLink || secondaryLink) && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {primaryLink && (
                <Button asChild size="lg" className="rounded-xl">
                  <Link href={primaryLink.href}>{primaryLink.label}</Link>
                </Button>
              )}
              {secondaryLink && (
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function InquiryCta({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle?: string;
  primary: LinkSpec;
  secondary?: LinkSpec;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-10 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      {subtitle && <p className="mt-2 text-white/90">{subtitle}</p>}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        {secondary && (
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
