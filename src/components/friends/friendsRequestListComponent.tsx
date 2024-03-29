import React, { FC } from "react";
import { MdCheck, MdClose } from "react-icons/md";
import { useGetRequestedFriendList } from "../../api/hooks/userHooks";
import { acceptFriendRequest, declineFriendRequest } from "../../api/userApi";
import { useAppDispatch } from "../../app/store";

const FriendsRequestList: FC = () => {
  const dispatch = useAppDispatch();

  const { loaded, requestedFriends, pendingFriends } =
    useGetRequestedFriendList();
  return (
    <div className="flex h-0 grow flex-col space-y-4 overflow-auto p-8">
      <h1 className="text-2xl text-white">Pending Friend Requests</h1>
      {pendingFriends.map((friend) => (
        <div
          className="flex flex-row justify-between border-b border-gray pb-4"
          key={friend.id}
        >
          <div className="flex flex-row space-x-4">
            <img
              className="m-auto h-14 w-14 rounded-full border border-black"
              src={
                friend.imageId !== "-1"
                  ? `${import.meta.env.VITE_API_ENDPOINT}/files/user/${friend.imageId}`
                  : "./blackboxuser.jpg"
              }
            />
            <p className="m-auto text-xl font-semibold text-white">
              {friend.name}
            </p>
          </div>
          <div className="flex flex-row space-x-4">
            <div
              className="m-auto cursor-pointer rounded-full bg-shade-2 p-1 hover:brightness-75 active:brightness-50"
              onClick={() => {
                dispatch(acceptFriendRequest(friend.id));
              }}
            >
              <MdCheck className="h-8 w-8 rounded-full  text-white/75" />
            </div>
            <div
              className="m-auto cursor-pointer rounded-full bg-shade-2 p-1 hover:brightness-75 active:brightness-50"
              onClick={() => {
                dispatch(declineFriendRequest(friend.id));
              }}
            >
              <MdClose className="h-8 w-8 rounded-full text-white/75" />
            </div>
          </div>
        </div>
      ))}
      <h1 className="text-2xl text-white">Requested Friends</h1>
      {requestedFriends.map((friend) => (
        <div
          className="flex flex-row justify-between border-b border-gray pb-4"
          key={friend.id}
        >
          <div className="flex flex-row space-x-4">
            <img
              className="m-auto h-14 w-14 rounded-full border border-black"
              src={
                friend.imageId !== "-1"
                  ? `${import.meta.env.VITE_API_ENDPOINT}/files/user/${friend.imageId}`
                  : "./blackboxuser.jpg"
              }
            />
            <p className="m-auto text-xl font-semibold text-white">
              {friend.name}
            </p>
          </div>
          <div className="flex flex-row space-x-4">
            <div
              className="m-auto cursor-pointer rounded-full bg-shade-2 p-1 hover:brightness-75 active:brightness-50"
              onClick={() => {
                dispatch(declineFriendRequest(friend.id));
              }}
            >
              <MdClose className="h-8 w-8 rounded-full text-white/75" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsRequestList;
