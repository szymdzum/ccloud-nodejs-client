/**
 * Main SMS parser for XmlForge
 * Coordinates the extraction and validation of SMS data from ATG SOAP XML
 */
import { parseStringPromise } from 'xml2js';
import logger from '../../logger.js';
import { SmsData, AtgSoapXml } from './types.js';
import { XML_PARSE_OPTIONS, validateSoapXml } from './utils.js';
import { extractPhoneNumber, extractMessage, extractBrand, extractOrderId } from './extractor.js';

/**
 * Parses ATG SOAP XML and extracts structured SMS data
 */
export async function extractSmsData(soapXml: string): Promise<SmsData> {
  try {
    validateSoapXml(soapXml);

    // Parse the SOAP XML
    const parsedXml = await parseStringPromise(soapXml, XML_PARSE_OPTIONS) as AtgSoapXml;

    // Extract required information
    const phoneNumber = extractPhoneNumber(parsedXml);
    const message = extractMessage(parsedXml);
    const brand = extractBrand(parsedXml);
    const orderId = extractOrderId(parsedXml);

    // Validate required fields
    if (!phoneNumber || !message || !brand) {
      throw new Error('Missing required fields in XML');
    }

    const smsData: SmsData = {
      phoneNumber,
      message,
      brand,
      orderId
    };

    logger.info('Extracted SMS data from XML', {
      orderId: smsData.orderId,
      brand: smsData.brand
    });

    return smsData;
  } catch (error) {
    logger.error('Failed to extract SMS data from XML', { error });
    throw new Error(`SMS data extraction failed: ${(error as Error).message}`);
  }
}