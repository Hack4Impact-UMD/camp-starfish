import { Box } from "@mantine/core";

interface DirectoryTableCellProps {
    data: string
}

export const DirectoryTableCell : React.FC<DirectoryTableCellProps> = ({
    data,
}) => {
    return (
        <Box className=" text-center py-3 px-2 bg-white">
            {data}
        </Box>
    );
}