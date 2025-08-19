import { NAV_CORE } from "../../app/nav-core";
import { DetailIcon } from "../icons/detail";
import { AppLink } from "../app-link";

export const DetailButton = ({ id }: { id: string }) => {
    return (
        <AppLink href={NAV_CORE.home.chore.byId(id)}>
            <DetailIcon />
        </AppLink>
    );
};
