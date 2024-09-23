"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Error = () => {
    return (
        <div className="h-full flex-col items-center justify-content space-y-4" >
            <Image
            src="/error.svg"
            height="300"
            width="300"
            alt="Error"
            className="dark:hidden"
            />

        <Image
            src="/error-dark.svg"
            height="300"
            width="300"
            alt="Error"
            className="hidden dark:block"
        />

        <h2 className="text-xl font-medium">
            Something went wrong!
        </h2>
        <Button asChild>
            <Link href="/documents">
                Go back 
            </Link>
        </Button>
        </div>
    )
}

export default Error;