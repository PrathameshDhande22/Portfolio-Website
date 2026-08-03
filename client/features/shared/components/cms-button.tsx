import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "./icon";
import type { ButtonLink } from "@/types/components";

export function CmsButton({ button }: { button: ButtonLink }) {
  const glyph = button.Icon ? <Icon name={button.Icon} /> : null;

  const content = (
    <>
      {button.IconAlign === "Left" ? glyph : null}
      {button.Text}
      {button.IconAlign !== "Left" ? glyph : null}
    </>
  );

  if (!button.Url) {
    return <Button variant={button.Variant}>{content}</Button>;
  }

  if (button.OpenInNewTab) {
    return (
      <a
        href={button.Url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: button.Variant })}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={button.Url} className={buttonVariants({ variant: button.Variant })}>
      {content}
    </Link>
  );
}
