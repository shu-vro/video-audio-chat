import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function InviteButton({
    children,
}: {
    children: React.ReactNode;
}) {
    const location = window.location;
    const inviteLink = `${location.origin}${location.pathname}`;
    return (
        <Drawer>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle>Invite Your Friends</DrawerTitle>
                        <DrawerDescription>
                            Send this link to your homies. <br />
                            Upto 4 People can join this room.
                        </DrawerDescription>
                        <Input
                            placeholder="Invite Link"
                            value={inviteLink}
                            readOnly
                        />
                    </DrawerHeader>
                    <DrawerFooter className="flex-row justify-between">
                        <DrawerClose asChild>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteLink);
                                    toast("Link Copied to Clipboard");
                                }}>
                                Copy Link
                            </Button>
                        </DrawerClose>
                        <DrawerClose asChild>
                            <Button>Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
