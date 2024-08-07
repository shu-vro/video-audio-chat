import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

export default function Home() {
    return (
        <div className="w-full min-h-[calc(100vh-4rem)] grid place-items-center">
            <div className="w-[400px] h-[400px]">
                <Tabs defaultValue="account" className="max-w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Create Room</TabsTrigger>
                        <TabsTrigger value="password">Join Room</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Room</CardTitle>
                                <CardDescription>
                                    Name your room and send url to your friends
                                </CardDescription>
                            </CardHeader>
                            <CreateRoom />
                        </Card>
                    </TabsContent>
                    <TabsContent value="password">
                        <Card>
                            <CardHeader>
                                <CardTitle>Join Room</CardTitle>
                                <CardDescription>
                                    Provide Room URL and click
                                </CardDescription>
                            </CardHeader>
                            <JoinRoom />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
