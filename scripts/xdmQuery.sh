#usage: ./xdmQuery.sh authToken sourceId/xdmType/metaAltId
#example: ./xdmQuery.sh ey123456789 tenant/schemas/_xdm.context.profile__union
#this is a query template which can be modified for different header values

curl --location --request GET 'https://platform-int.adobe.io/data/foundation/schemaregistry/'$2 \
--header 'x-gw-ims-org-id: 2398391F5B4E0B150A494124@AdobeOrg' \
--header 'Authorization: bearer '$1 \
--header 'Content-Type: application/json' \
--header 'Accept: application/vnd.adobe.xed-full+json;version=1' \
--header 'x-api-key: acp_foundation_schemaregistry' \
