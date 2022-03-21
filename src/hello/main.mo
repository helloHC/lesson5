import Iter "mo:base/Iter";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor Microblog {
    public type Message = {
        content: Text;
        sinced: Time.Time;
        author: Text;
    };

    public type Microblog = actor {
        follow: shared(Principal) -> async ();
        follows: shared query () -> async [Principal];
        post: shared (Text, Text) -> async ();
        posts: shared query (Time.Time) -> async [Message];
        timeline: shared (Time.Time) -> async [Message];
    };

    stable var followed: List.List<Principal> = List.nil();
    stable var name: Text = "";

    public shared func follow(id: Principal) : async () {
        followed := List.push(id, followed)
    };

    public shared query func follows(): async [Principal] {
        List.toArray(followed)
    };

    stable var messages: List.List<Message> = List.nil();

    public shared func post(otp: Text, content: Text): async () {
        // assert(Principal.toText(msg.caller) == "l6z5v-7lcmi-tzj4u-362dn-2tvfs-7slx3-hlc6m-k7hsn-6nno2-gtdiw-rqe");
        assert(otp == "111");
        let sinced = Time.now();
        let author = Principal.toText(Principal.fromActor(Microblog));
        messages := List.push({ content; sinced; author }, messages);
    };

    public shared query func posts(since: Time.Time): async [Message] {
        List.toArray(List.filter<Message>(messages, func ({sinced}) = sinced >= since))
    };

    public shared func timeline(since: Time.Time): async [Message] {
        var all : List.List<Message> = List.nil();

        for(id in Iter.fromList(followed)) {
            let canister : Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts(since);
            for (msg in Iter.fromArray(msgs)) {
                all := List.push(msg, all);
            };
        };

        List.toArray(all)
    };

    public shared query func get_name(): async ?Text {
        ?name
    };

    public shared func set_name(otp: Text, newName: Text): async () {
        assert(otp == "111");
        name := newName;
    };
};