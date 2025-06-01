import { Fragment } from "react";
import { ChoreInList } from "./choreInList";
import { Chore } from "../../data/domains/chore/types";

interface ChoresOverviewProps {
    chores: Chore[];
}

export const ChoresOverview = ({ chores }: ChoresOverviewProps) =>
    chores
        .reduce(
            (upToNow: [string, Chore[]][], curr: Chore) =>
                [
                    ...upToNow.filter(([key, _]) => key !== curr.location.name),
                    upToNow.some(([key, _]) => key === curr.location.name)
                        ? [
                              curr.location.name,
                              [
                                  ...(upToNow
                                      .flatMap(([key, list]) => (key === curr.location.name ? list : null))
                                      .filter(e => e !== null) ?? []),
                                  curr,
                              ],
                          ]
                        : [curr.location.name, [curr]],
                ] as [string, Chore[]][],
            []
        )
        .map(([location, chores]) => (
            <>
                <div className="sticky top-0 z-30 bg-indigo-50 pt-4">
                    <h2 className="text-xl italic">{location}</h2>
                    <hr className="my-4 border-gray-500" />
                </div>

                {chores.map((iter: Chore) => (
                    <Fragment key={iter.id}>
                        <ChoreInList name={iter.name} id={iter.id} timeInvalid={iter.timeInvalid} />
                    </Fragment>
                ))}
            </>
        ));
