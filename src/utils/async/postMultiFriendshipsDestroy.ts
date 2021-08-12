import { mutate } from "store";

import type { Friend } from "definitions";

import { TWITTER_CLIENT } from "../../constants";

/**
 * @async
 * @function postMultiFriendshipsDestroy
 * @summary Unfollows multiple users from USER_IDS
 * @see {@link https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/post-friendships-destroy}
 * @param {Object} access
 * @param {Array<number>} userId
 */

const friendshipsDestroy = async (
  access: {
    key: string;
    secret: string;
  },
  userId: number
): Promise<Array<Friend>> => {
  const response = await fetch(
    `${TWITTER_CLIENT}?endpoint=friendships_destroy&access_key=${access.key}&access_secret=${access.secret}&user_id=${userId}`
  );
  if (!response.ok) {
    Promise.reject(new Error("fail")).then(
      () => null, // not called
      (error) => console.log(error)
    );
    throw Error(response.status.toString());
  }
  return response.json();
};

const postMultiFriendshipsDestroy = async (
  access: {
    key: string;
    secret: string;
  },
  userIds: Array<number>
) => {
  let promises = [];
  for (const userId of userIds) {
    promises.push(friendshipsDestroy(access, userId));
  }
  try {
    // @ts-ignore
    const response: Array<Friend> = await Promise.all(promises);
    if (response.length) {
      for (const item of response) {
        mutate((draft) => {
          draft.friends.data = draft.friends.data.filter(
            (el: Friend) => el.id !== item.id
          );
        });
      }
    }
  } catch (error) {
    mutate((draft) => {
      draft.friends.error = error;
    });
  }
};

export default postMultiFriendshipsDestroy;
