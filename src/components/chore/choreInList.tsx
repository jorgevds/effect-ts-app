import { format } from "date-fns";
import { DetailButton } from "./detailButton";

export const ChoreInList = ({ name, timeInvalid, id }: { name: string; timeInvalid: Date; id: string }) => {
    return (
        <div className="flex items-center justify-between my-4">
            <div>
                <div>{name}</div>
                <div className="text-xs">Do after {format(timeInvalid, "do MMMM")}</div>
            </div>

            <div className="flex items-center">
                <div className="mr-4 z-20">
                    <DetailButton id={id} />
                </div>
            </div>
        </div>
    );
};
